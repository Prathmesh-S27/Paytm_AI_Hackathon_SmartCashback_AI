"use client";

import { useEffect, useState } from "react";
import { UserCategoryProfile, Transaction, Recommendation } from "@/types";
import { api } from "@/lib/api";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { formatCurrency, formatDate, getCategoryColor } from "@/lib/utils";
import { SpendingPieChart } from "@/components/charts/SpendingPieChart";
import { SpendingTrendChart } from "@/components/charts/SpendingTrendChart";
import Link from "next/link";
import { MapPin, Navigation, Tag, Sparkles } from "lucide-react";

export default function CustomerOverview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [spending, setSpending] = useState<UserCategoryProfile[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(false);
      const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
      if (!user.id) return;
      
      const [spendingRes, txRes, recsRes, trendRes] = await Promise.all([
        api.getUserSpending(user.id).catch(() => []),
        api.getUserTransactions(user.id).catch(() => []),
        api.getUserRecommendations(user.id).catch(() => []),
        api.getUserSpendingChart(user.id).catch(() => [])
      ]);
      
      setSpending(spendingRes);
      setTransactions(txRes.slice(0, 10)); // Just recent
      setRecommendations(recsRes.slice(0, 3)); // Top 3
      setTrendData(trendRes);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <div className="grid grid-cols-1 md:grid-cols-4 gap-6"><SkeletonCard/><SkeletonCard/><SkeletonCard/><SkeletonCard/></div>;
  if (error) return <ErrorState onRetry={loadData} />;

  const totalSpent = spending.reduce((sum, s) => sum + s.total_spend, 0);
  const totalTx = spending.reduce((sum, s) => sum + s.transaction_count, 0);
  const totalDiscount = transactions.reduce((sum, t) => sum + t.cashback_amount, 0);

  const chartData = trendData.length > 0 ? trendData : [{ date: new Date().toISOString(), amount: 0 }];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-slate-400">Welcome back! Here's your spending summary.</p>
        </div>
        <Link href="/pay">
          <Button size="lg" className="shadow-indigo-500/25 shadow-lg bg-gradient-primary">
            Make a Payment
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Spent" value={formatCurrency(totalSpent)} icon="Wallet" />
        <StatCard title="Transactions" value={totalTx} icon="Receipt" />
        <StatCard title="Categories Explored" value={spending.length} icon="Tags" />
        <StatCard title="Discounts Earned" value={formatCurrency(totalDiscount)} icon="PiggyBank" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 col-span-1 lg:col-span-2">
          <h3 className="text-lg font-bold mb-4 text-slate-50">Spending Trend</h3>
          <SpendingTrendChart data={chartData} />
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 text-slate-50">Spending by Category</h3>
          <SpendingPieChart data={spending} />
        </Card>
      </div>

      {recommendations.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="text-amber-400" /> Curated Offers For You
            </h2>
            <Link href="/customer/recommendations" className="text-indigo-400 text-sm hover:underline">View all</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.map((rec, i) => (
              <Card key={rec.id} gradientBorder hoverLift className="p-5 animate-slideUp" style={{animationDelay: `${i * 100}ms`}}>
                <div className="flex justify-between items-start mb-3">
                  <Badge color={getCategoryColor(rec.merchant_category)}>{rec.merchant_category}</Badge>
                  {rec.coupon && (
                    <Badge variant="success" className="bg-emerald-500 text-white border-none flex gap-1 items-center">
                      <Tag size={12}/> 
                      {rec.coupon.discount_type === 'percentage' ? `${rec.coupon.discount_value}% OFF` : `₹${rec.coupon.discount_value} OFF`}
                    </Badge>
                  )}
                </div>
                <h4 className="text-lg font-bold mb-1">{rec.merchant?.name || 'Local Merchant'}</h4>
                <div className="flex items-center text-sm text-slate-400 mb-4 gap-2">
                  <MapPin size={14} /> {rec.merchant?.address || 'Mumbai, MH'}
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3 text-sm text-slate-300 border border-slate-700/50 mb-4 h-16 overflow-hidden">
                  {rec.reason}
                </div>
                <Link href={`/pay?merchant=${rec.merchant_id}`} className="block w-full">
                  <Button variant="secondary" className="w-full justify-center">
                    Pay & Claim
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Recent Transactions</h2>
          <Link href="/customer/transactions" className="text-indigo-400 text-sm hover:underline">View all</Link>
        </div>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Discount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-400">No transactions found.</TableCell>
                </TableRow>
              ) : (
                transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-slate-300">{formatDate(tx.created_at)}</TableCell>
                    <TableCell className="font-medium text-slate-100">{tx.merchant?.name || tx.merchant_id.substring(0,8)}</TableCell>
                    <TableCell>
                      <Badge color={getCategoryColor(tx.merchant_category)}>{tx.merchant_category}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(tx.amount)}</TableCell>
                    <TableCell className="text-right text-emerald-400">
                      {tx.cashback_amount > 0 ? `+${formatCurrency(tx.cashback_amount)}` : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={tx.payment_status === 'completed' ? 'success' : 'warning'}>{tx.payment_status}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
