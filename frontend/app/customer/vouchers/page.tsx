"use client";

import { useEffect, useState } from "react";
import { Recommendation } from "@/types";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Store, Tag, Clock, MapPin } from "lucide-react";
import { formatDate, getCategoryColor } from "@/lib/utils";
import Link from "next/link";

export default function VouchersPage() {
  const [loading, setLoading] = useState(true);
  const [vouchers, setVouchers] = useState<Recommendation[]>([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (!user.id) return;

    // Fetch recommendations and filter those that have a coupon
    api.getUserRecommendations(user.id).then(res => {
      // Filter out recommendations without a coupon
      const withCoupons = res.filter(r => r.coupon != null);
      
      // Deduplicate by coupon_id just in case the same coupon was recommended multiple times
      const uniqueCoupons = [];
      const seen = new Set();
      for (const rec of withCoupons) {
        if (!seen.has(rec.coupon_id)) {
          seen.add(rec.coupon_id);
          uniqueCoupons.push(rec);
        }
      }
      
      setVouchers(uniqueCoupons);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="grid grid-cols-1 md:grid-cols-3 gap-6"><SkeletonCard/><SkeletonCard/><SkeletonCard/></div>;

  return (
    <div className="animate-fadeIn max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Vouchers</h1>
        <p className="text-slate-400">View and manage the exclusive offers you've unlocked from your transactions.</p>
      </div>

      {vouchers.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-slate-700 bg-slate-800/20">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
            <Tag size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">No Vouchers Yet</h3>
          <p className="text-slate-400 max-w-md mx-auto mb-6">
            Make payments at local merchants to unlock exclusive cashback and discount vouchers!
          </p>
          <Link href="/pay">
            <Button>Make a Payment</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vouchers.map((rec, i) => (
            <Card key={rec.id} hoverLift className="overflow-hidden flex flex-col animate-slideUp" style={{animationDelay: `${i * 50}ms`}}>
              <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/5 p-6 border-b border-slate-800">
                <div className="flex justify-between items-start mb-4">
                  <Badge color={getCategoryColor(rec.merchant_category)}>{rec.merchant_category}</Badge>
                  <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400">
                    <Store size={18} />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-emerald-400 mb-1 flex items-center gap-2">
                  <Tag size={20} /> 
                  {rec.coupon!.discount_type === 'percentage' 
                    ? `${rec.coupon!.discount_value}% OFF` 
                    : `₹${rec.coupon!.discount_value} OFF`}
                </h3>
                <h4 className="font-bold text-slate-100">{rec.coupon!.title}</h4>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <p className="text-sm text-slate-400 mb-4 flex-1">
                  {rec.coupon!.description || rec.reason || "Exclusive offer just for you."}
                </p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <MapPin size={14} className="text-indigo-400" />
                    Valid at {rec.merchant?.name || 'Local Store'}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock size={14} className="text-amber-400" />
                    Valid until {formatDate(rec.coupon!.valid_until)}
                  </div>
                </div>
                
                <Link href={`/pay?merchant=${rec.merchant_id}`} className="block w-full mt-auto">
                  <Button className="w-full bg-indigo-500 hover:bg-indigo-600">
                    Use Voucher Now
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
