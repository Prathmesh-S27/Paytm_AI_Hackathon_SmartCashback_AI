"use client";

import { useEffect, useState } from "react";
import { User, Merchant } from "@/types";
import { api } from "@/lib/api";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";
import { RevenueChart } from "@/components/charts/RevenueChart";

export default function MerchantOverview() {
  const [loading, setLoading] = useState(true);
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [revData, setRevData] = useState<any[]>([]);
  const [activeCouponsCount, setActiveCouponsCount] = useState(0);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (user.id) {
      // In a real app we'd fetch the merchant profile owned by this user
      // For MVP we assume the user is "m1" and they own "merch_1"
      api.getMerchantByOwner(user.id).then(res => {
        const m = res[0]; 
        if (m) {
          setMerchant(m);
          Promise.all([
            api.getMerchantAnalytics(m.id),
            api.getMerchantRevenueChart(m.id),
            api.getMerchantCoupons(m.id)
          ]).then(([aRes, rRes, cRes]) => {
            setAnalytics(aRes);
            setRevData(rRes);
            setActiveCouponsCount(cRes.filter(c => c.active).length);
          }).catch(console.error).finally(() => setLoading(false));
        } else {
          setLoading(false);
        }
      });
    }
  }, []);

  if (loading) return <div className="grid grid-cols-1 md:grid-cols-4 gap-6"><SkeletonCard/><SkeletonCard/><SkeletonCard/><SkeletonCard/></div>;
  if (!merchant || !analytics) return <div>No data available</div>;

  const repeatRate = analytics.customer_count > 0 
    ? Math.round((analytics.repeat_customer_count / analytics.customer_count) * 100) 
    : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{merchant.name} Dashboard</h1>
        <p className="text-slate-400">Overview of your store's performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Sales" value={formatCurrency(analytics.total_revenue || 0)} icon="IndianRupee" />
        <StatCard title="Transactions" value={analytics.transaction_count || 0} icon="Receipt" />
        <StatCard title="Unique Customers" value={analytics.customer_count || 0} icon="Users" />
        <StatCard title="Discounts Given" value={formatCurrency(analytics.total_cashback_given || analytics.avg_cashback * analytics.transaction_count || 0)} icon="Gift" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 col-span-1 lg:col-span-2">
          <h3 className="text-lg font-bold mb-4 text-slate-50">Revenue Trend</h3>
          <RevenueChart data={revData.length > 0 ? revData : [{ date: new Date().toISOString(), amount: 0 }]} />
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 text-slate-50">Customer Insights</h3>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-slate-400">Average Bill Value</div>
              <div className="text-2xl font-bold">{formatCurrency(merchant.average_bill)}</div>
            </div>
            <div>
              <div className="text-sm text-slate-400">Repeat Customer Rate</div>
              <div className="text-2xl font-bold">{repeatRate}%</div>
            </div>
            <div>
              <div className="text-sm text-slate-400">Active Coupons</div>
              <div className={`text-2xl font-bold ${activeCouponsCount > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                {activeCouponsCount} Active
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
