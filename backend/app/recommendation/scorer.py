DEFAULT_WEIGHTS = {
    'category_relevance': 0.30,
    'price_similarity': 0.25,
    'distance': 0.20,
    'user_history': 0.15,
    'merchant_quality': 0.10,
}

def calculate_category_score(current_cat: str, candidate_cat: str, related_cats: dict[str, float]) -> float:
    if current_cat == candidate_cat:
        return 1.0
    return related_cats.get(candidate_cat, 0.0)

def calculate_user_history_match(user_profile, candidate_merchant) -> float:
    if not user_profile or user_profile.transaction_count == 0:
        return 0.5
    
    tx_count = user_profile.transaction_count
    score = min(1.0, tx_count / 10.0)
    return max(0.2, score)

def calculate_merchant_quality(merchant) -> float:
    rating_score = merchant.rating / 5.0
    popularity = min(1.0, merchant.total_transactions / 1000.0)
    return (rating_score * 0.8) + (popularity * 0.2)

def calculate_weighted_score(scores_dict: dict, weights: dict = DEFAULT_WEIGHTS) -> float:
    total = 0.0
    for k, w in weights.items():
        total += scores_dict.get(k, 0.0) * w
    return total
