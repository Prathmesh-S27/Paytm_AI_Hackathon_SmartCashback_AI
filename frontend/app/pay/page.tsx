"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Merchant, User, Recommendation, Coupon } from "@/types";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CheckCircle2, ChevronRight, Store, Tag } from "lucide-react";
import { formatCurrency, getCategoryColor } from "@/lib/utils";

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMerchantId = searchParams.get("merchant");
  
  const [user, setUser] = useState<User | null>(null);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [merchantCoupons, setMerchantCoupons] = useState<Coupon[]>([]);
  const [amount, setAmount] = useState("");
  const [selectedCouponId, setSelectedCouponId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<{tx: any, recommendations: Recommendation[]} | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) setUser(JSON.parse(savedUser));
    
    api.getMerchants().then(res => {
      setMerchants(res);
      if (initialMerchantId) {
        const m = res.find(x => x.id === initialMerchantId);
        if (m) handleMerchantSelect(m);
      }
    });
  }, [initialMerchantId]);

  const handleMerchantSelect = async (m: Merchant) => {
    setSelectedMerchant(m);
    setSelectedCouponId(""); // Reset selection
    // Fetch coupons for this merchant
    try {
      const coupons = await api.getCoupons(`merchant_id=${m.id}`);
      // Filter only active coupons
      setMerchantCoupons(coupons.filter(c => c.active));
    } catch (e) {
      console.error(e);
      setMerchantCoupons([]);
    }
  };

  // Calculate selected coupon discount
  const parsedAmount = parseFloat(amount) || 0;
  let selectedCoupon: Coupon | null = null;
  let bestDiscount = 0;

  if (parsedAmount > 0 && selectedCouponId) {
    const c = merchantCoupons.find(x => x.id === selectedCouponId);
    if (c && parsedAmount >= c.minimum_transaction_amount) {
      if (c.discount_type === 'percentage') {
        bestDiscount = parsedAmount * (c.discount_value / 100);
        if (c.maximum_discount) {
          bestDiscount = Math.min(bestDiscount, c.maximum_discount);
        }
      } else {
        bestDiscount = c.discount_value;
      }
      selectedCoupon = c;
    }
  }

  const finalPayable = parsedAmount - bestDiscount;

  const handlePay = async () => {
    if (!user || !selectedMerchant || !amount) return;
    try {
      setLoading(true);
      const res = await api.makePayment({
        user_id: user.id,
        merchant_id: selectedMerchant.id,
        amount: parsedAmount,
        ...(selectedCoupon && { coupon_id: selectedCoupon.id })
      } as any);
      setSuccessData({ tx: res.transaction, recommendations: res.recommendations });
    } catch (err) {
      alert("Payment failed");
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="max-w-2xl mx-auto text-center py-10 animate-slideUp">
        <div className="w-24 h-24 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-3xl font-bold mb-2">Payment Successful!</h2>
        <p className="text-slate-400 text-lg mb-8">
          You paid {formatCurrency(successData.tx.amount)} to {selectedMerchant?.name}
        </p>
        
        {successData.tx.cashback_amount > 0 && (
          <div className="inline-block bg-emerald-500/20 border border-emerald-500 text-emerald-300 px-6 py-3 rounded-full font-bold mb-12 animate-pulse-glow">
            Saved {formatCurrency(successData.tx.cashback_amount)} with an Offer!
          </div>
        )}

        {successData.recommendations && successData.recommendations.length > 0 && (
          <div className="text-left bg-slate-800/50 p-6 rounded-2xl border border-slate-700 mt-8 animate-fadeIn animate-delay-200">
            <h3 className="text-xl font-bold mb-4 text-amber-400 flex items-center gap-2">
              Most suitable for you
            </h3>
            <div className="space-y-4">
              {successData.recommendations.slice(0, 2).map((rec) => (
                <Card key={rec.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <Badge color={getCategoryColor(rec.merchant_category)} className="mb-2">{rec.merchant_category}</Badge>
                    <h4 className="font-bold text-lg">{rec.merchant?.name || "Merchant"}</h4>
                    <p className="text-sm text-slate-400">{rec.reason}</p>
                    {rec.coupon && (
                      <Badge variant="success" className="mt-2 text-xs py-0.5">
                        <Tag size={10} className="inline mr-1" />
                        {rec.coupon.title}
                      </Badge>
                    )}
                  </div>
                  <Button variant="outline" onClick={() => {
                    handleMerchantSelect(merchants.find(m => m.id === rec.merchant_id)!);
                    setSuccessData(null);
                    setAmount("");
                    setSelectedCouponId("");
                  }}>
                    Use Offer
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex gap-4 justify-center">
          <Button variant="secondary" onClick={() => router.push('/customer')}>Back to Dashboard</Button>
          <Button onClick={() => { setSuccessData(null); setAmount(""); setSelectedCouponId(""); }}>Make Another Payment</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-10 animate-fadeIn">
      <h1 className="text-3xl font-bold mb-8 text-center">Secure Payment</h1>
      
      <Card className="p-6 md:p-8">
        {!selectedMerchant ? (
          <div>
            <h3 className="font-medium mb-4 text-slate-300">Select Merchant</h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
              {merchants.map(m => (
                <div 
                  key={m.id} 
                  onClick={() => handleMerchantSelect(m)}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-700 hover:border-indigo-500/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${getCategoryColor(m.category)}20`, color: getCategoryColor(m.category) }}>
                      <Store size={20} />
                    </div>
                    <div>
                      <div className="font-bold">{m.name}</div>
                      <div className="text-xs text-slate-400">{m.category}</div>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-500" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="animate-slideIn">
            <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
              <div>
                <h3 className="text-xl font-bold">{selectedMerchant.name}</h3>
                <p className="text-sm text-slate-400">{selectedMerchant.address}</p>
              </div>
              <button 
                onClick={() => setSelectedMerchant(null)}
                className="text-xs text-indigo-400 hover:underline"
              >
                Change
              </button>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-400 mb-2">Amount to Pay</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-slate-400">₹</span>
                <input 
                  type="number" 
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-3xl font-bold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  placeholder="0.00"
                />
              </div>
            </div>

            {merchantCoupons.length > 0 && parsedAmount > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-400 mb-2">Available Offers</label>
                <select 
                  value={selectedCouponId} 
                  onChange={e => setSelectedCouponId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-200 outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="">-- No Offer Selected --</option>
                  {merchantCoupons.map(c => (
                    <option key={c.id} value={c.id} disabled={parsedAmount < c.minimum_transaction_amount}>
                      {c.title} {parsedAmount < c.minimum_transaction_amount ? `(Min. spend ₹${c.minimum_transaction_amount})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedCoupon && bestDiscount > 0 && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex justify-between items-center animate-slideIn">
                <div>
                  <div className="text-emerald-400 font-bold flex items-center gap-1">
                    <Tag size={16} /> Offer Applied: {selectedCoupon.title}
                  </div>
                  <div className="text-sm text-slate-300">
                    You save {formatCurrency(bestDiscount)}!
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-400 line-through">{formatCurrency(parsedAmount)}</div>
                  <div className="text-xl font-bold text-white">{formatCurrency(finalPayable)}</div>
                </div>
              </div>
            )}

            <Button 
              className="w-full py-6 text-lg rounded-xl bg-gradient-primary shadow-indigo-500/25 shadow-xl"
              onClick={handlePay}
              disabled={loading || !amount || parsedAmount <= 0}
              isLoading={loading}
            >
              Confirm & Pay {bestDiscount > 0 ? formatCurrency(finalPayable) : ''}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function PayPage() {
  return (
    <div className="min-h-screen bg-slate-900 px-4">
      <Suspense fallback={<div className="text-center pt-20">Loading payment module...</div>}>
        <PaymentContent />
      </Suspense>
    </div>
  );
}
