"use client";

import { useEffect, useState } from "react";
import { Recommendation } from "@/types";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { formatCurrency, getCategoryColor } from "@/lib/utils";
import Link from "next/link";
import { MapPin, Navigation, Tag, Sparkles, ChevronDown, ChevronUp } from "lucide-react";

export default function RecommendationsPage() {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (user.id) {
      api.getUserRecommendations(user.id).then(res => {
        setRecommendations(res);
      }).catch(err => console.error(err)).finally(() => setLoading(false));
    }
  }, []);

  return (
    <div className="animate-fadeIn pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500 flex items-center gap-2">
          <Sparkles className="text-amber-400" /> AI Recommendations
        </h1>
        <p className="text-slate-400">Curated offers based on your spending habits and location.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard/><SkeletonCard/><SkeletonCard/>
        </div>
      ) : recommendations.length === 0 ? (
        <Card className="p-12 text-center text-slate-400">
          No recommendations available at the moment. Try making some transactions!
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec, i) => (
            <Card key={rec.id} gradientBorder hoverLift className="flex flex-col animate-slideUp" style={{animationDelay: `${i * 50}ms`}}>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <Badge color={getCategoryColor(rec.merchant_category)}>{rec.merchant_category}</Badge>
                  {rec.coupon && (
                    <Badge variant="success" className="bg-emerald-500 text-white border-none shadow-lg shadow-emerald-500/20 px-3 py-1">
                      <Tag size={12} className="mr-1 inline"/> 
                      {rec.coupon.discount_type === 'percentage' ? `${rec.coupon.discount_value}% OFF` : `₹${rec.coupon.discount_value} OFF`}
                    </Badge>
                  )}
                </div>
                
                <h3 className="text-xl font-bold mb-1">{rec.merchant?.name || 'Local Merchant'}</h3>
                
                <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                  <span className="flex items-center gap-1"><MapPin size={14} /> {rec.merchant?.address || 'Mumbai'}</span>
                </div>

                <div className="mb-4">
                  <ScoreBar score={rec.score} label="Match Score" />
                </div>

                <div className="bg-slate-900/50 rounded-lg p-3 text-sm text-slate-300 border border-slate-700/50 mb-4 italic">
                  "{rec.reason}"
                </div>

                <div className="mt-auto pt-4 flex flex-col gap-3">
                  <button 
                    onClick={() => setExpandedId(expandedId === rec.id ? null : rec.id)}
                    className="text-xs text-indigo-400 flex items-center justify-center gap-1 hover:text-indigo-300"
                  >
                    {expandedId === rec.id ? <><ChevronUp size={14}/> Hide AI Analysis</> : <><ChevronDown size={14}/> Why this?</>}
                  </button>
                  
                  {expandedId === rec.id && rec.gemini_explanation && (
                    <div className="text-xs text-slate-400 bg-slate-900 p-3 rounded-md border border-slate-800 animate-fadeIn">
                      {rec.gemini_explanation}
                    </div>
                  )}

                  <Link href={`/pay?merchant=${rec.merchant_id}`}>
                    <Button variant="primary" className="w-full">
                      Pay Merchant
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
