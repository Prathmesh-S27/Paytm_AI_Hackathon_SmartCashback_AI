import uuid
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.merchant_service import get_merchant, get_nearby_merchants
from app.services.spending_profile_service import get_user_category_profile
from app.services.category_rule_service import get_related_categories, get_related_categories_with_strength
from app.services.price_similarity_service import calculate_price_similarity
from app.services.distance_service import haversine_distance, calculate_distance_score
from app.services.coupon_service import get_best_coupon_for_recommendation
from app.services.recommendation_audit_service import store_recommendation_log
from app.recommendation.scorer import calculate_category_score, calculate_user_history_match, calculate_merchant_quality, calculate_weighted_score
from app.recommendation.validator import validate_gemini_response
from app.ai.gemini_service import GeminiService
from app.models.recommendation import Recommendation
from app.services.spending_profile_service import get_all_user_profiles
from app.schemas.recommendation import RecommendationRead
from app.schemas.coupon import CouponRead
from app.schemas.gemini import GeminiCandidate

class RecommendationEngine:
    def __init__(self):
        self.gemini_service = GeminiService()

    async def generate_recommendations(self, transaction_id: uuid.UUID, user_id: uuid.UUID, merchant_id: uuid.UUID, amount: float, db: AsyncSession, redis_client=None) -> list[RecommendationRead]:
        # 1. Get current merchant
        current_merchant = await get_merchant(merchant_id, db)
        if not current_merchant:
            return []
            
        current_cat = current_merchant.category

        
        # 2. Get ALL of the user's spending profiles to compare properly across categories
        all_profiles = await get_all_user_profiles(user_id, db)
        profile_map = {p.category: p for p in all_profiles}
        
        # User's current category profile
        profile = profile_map.get(current_cat)
        user_cat_avg = profile.average_spend if profile and profile.average_spend > 0 else amount
        
        # 3. Allowed categories with relationship strengths
        allowed_cats_with_strength = await get_related_categories_with_strength(current_cat, db)
        allowed_cats = list(allowed_cats_with_strength.keys())
        
        # 4. Candidates within 5km radius, filtered by allowed categories
        all_candidates = await get_nearby_merchants(current_merchant.latitude, current_merchant.longitude, 5.0, db, categories=allowed_cats)
        
        # Filter down strictly by haversine distance since bounding box is a square
        candidates = []
        for m in all_candidates:
            if m.id == merchant_id:
                continue
            dist = haversine_distance(current_merchant.latitude, current_merchant.longitude, m.latitude, m.longitude)
            if dist <= 5.0:
                candidates.append(m)
        
        if not candidates:
            return []
            
        # 5. Score each candidate
        scored_candidates = []
        for m in candidates:
            # Category score uses strength from relationship table
            cat_score = calculate_category_score(current_cat, m.category, allowed_cats_with_strength)
            
            # Price similarity: user's average in the TARGET category vs merchant's average bill
            target_profile = profile_map.get(m.category)
            target_user_avg = target_profile.average_spend if target_profile and target_profile.average_spend > 0 else amount
            price_sim = calculate_price_similarity(target_user_avg, m.average_bill)
            
            # Distance from current merchant to candidate
            dist_km = haversine_distance(
                current_merchant.latitude, current_merchant.longitude, 
                m.latitude, m.longitude
            )
            dist_score = calculate_distance_score(dist_km)
            
            # User history match based on transaction count in this category
            hist_score = calculate_user_history_match(profile, m)
            
            # Merchant quality based on rating and popularity
            qual_score = calculate_merchant_quality(m)
            
            scores_dict = {
                'category_relevance': cat_score,
                'price_similarity': price_sim,
                'distance': dist_score,
                'user_history': hist_score,
                'merchant_quality': qual_score
            }
            final_score = calculate_weighted_score(scores_dict)
            
            scored_candidates.append({
                'merchant': m,
                'final_score': final_score,
                'breakdown': scores_dict,
                'distance_km': round(dist_km, 2)
            })
            
        # 6. Sort by score descending and select top 5 (deterministic only)
        scored_candidates.sort(key=lambda x: x['final_score'], reverse=True)
        top_candidates = scored_candidates[:5]
        
        selected_candidates = []
        for c in top_candidates:
            # We must pass target_user_avg for the reason generation
            target_profile = profile_map.get(c['merchant'].category)
            target_user_avg = target_profile.average_spend if target_profile and target_profile.average_spend > 0 else amount
            reason = self._generate_reason(c, current_cat, target_user_avg)
            selected_candidates.append((c, reason))
            
        gemini_result = None # No AI ranking anymore

        # 10. Store recommendations and audit logs
        final_recommendations = []
        coupon_given = False
        for cand, reason in selected_candidates:
            m = cand['merchant']
            
            best_coupon = None
            if not coupon_given:
                best_coupon = await get_best_coupon_for_recommendation(m.id, user_id, amount, db)
                if best_coupon:
                    coupon_given = True
            
            rec = Recommendation(
                user_id=user_id,
                transaction_id=transaction_id,
                merchant_id=m.id,
                merchant_category=m.category,
                coupon_id=best_coupon.id if best_coupon else None,
                score=round(cand['final_score'], 4),
                reason=reason,
                gemini_explanation=reason if gemini_result else None
            )
            db.add(rec)
            await db.commit()
            await db.refresh(rec)
            
            target_profile = profile_map.get(m.category)
            target_user_avg = target_profile.average_spend if target_profile and target_profile.average_spend > 0 else amount

            # Audit log for admin transparency
            log_data = {
                'user_id': user_id,
                'transaction_id': transaction_id,
                'current_merchant_id': current_merchant.id,
                'current_category': current_cat,
                'candidate_merchant_id': m.id,
                'candidate_category': m.category,
                'user_category_average': round(target_user_avg, 2),
                'merchant_average_bill': round(m.average_bill, 2),
                'distance_km': cand['distance_km'],
                'category_score': round(cand['breakdown']['category_relevance'], 4),
                'price_similarity': round(cand['breakdown']['price_similarity'], 4),
                'history_score': round(cand['breakdown']['user_history'], 4),
                'merchant_score': round(cand['breakdown']['merchant_quality'], 4),
                'final_score': round(cand['final_score'], 4),
                'gemini_reason': reason,
                'final_decision': 'recommended'
            }
            await store_recommendation_log(log_data, db)
            
            coupon_data = None
            if best_coupon:
                coupon_data = CouponRead.model_validate(best_coupon)
                
            from app.schemas.merchant import MerchantRead
                
            final_recommendations.append(RecommendationRead(
                id=rec.id,
                user_id=rec.user_id,
                transaction_id=rec.transaction_id,
                merchant_id=rec.merchant_id,
                merchant_category=rec.merchant_category,
                coupon_id=rec.coupon_id,
                score=rec.score,
                reason=rec.reason,
                gemini_explanation=rec.gemini_explanation,
                status=rec.status,
                created_at=rec.created_at,
                coupon=coupon_data,
                merchant=MerchantRead.model_validate(m)
            ))

        return final_recommendations

    def _generate_reason(self, candidate: dict, current_cat: str, user_avg: float) -> str:
        """Generate a human-readable explanation for the recommendation."""
        m = candidate['merchant']
        breakdown = candidate['breakdown']
        dist = candidate['distance_km']
        
        parts = []
        
        if m.category == current_cat:
            parts.append(f"Same category ({current_cat})")
        else:
            parts.append(f"Related category ({m.category})")
        
        price_sim_pct = round(breakdown['price_similarity'] * 100)
        if price_sim_pct >= 80:
            parts.append(f"average bill ₹{m.average_bill:,.0f} is close to your usual spend of ₹{user_avg:,.0f}")
        elif price_sim_pct >= 50:
            parts.append(f"average bill ₹{m.average_bill:,.0f}")
        
        if dist <= 2.0:
            parts.append(f"only {dist} km away")
        elif dist <= 5.0:
            parts.append(f"{dist} km away")
        
        if m.cashback_percentage > 0:
            parts.append(f"{m.cashback_percentage:.0f}% cashback available")
        
        if m.rating >= 4.5:
            parts.append(f"highly rated ({m.rating:.1f}★)")
        
        return ". ".join(parts) + "."
