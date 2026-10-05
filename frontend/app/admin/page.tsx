"use client";

import { useEffect, useState } from "react";
import { AdminAnalytics } from "@/types";
import { api } from "@/lib/api";
import { StatCard } from "@/components/ui/StatCard";
import { formatCurrency } from "@/lib/utils";

export default function AdminOverview() {
  const [stats, setStats] = useState<AdminAnalytics | null>(null);

  useEffect(() => {
    api.getAdminAnalytics().then(res => setStats(res)).catch(console.error);
  }, []);

  return (
    <div className="animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Platform Overview</h1>
        <p className="text-slate-400">Global metrics for the entire cashback ecosystem.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total GMV" value={formatCurrency(stats?.total_gmv || 0)} icon="Banknote" />
        <StatCard title="Total Cashback" value={formatCurrency(stats?.total_cashback || 0)} icon="PiggyBank" />
        <StatCard title="Total Transactions" value={stats?.total_transactions || 0} icon="Receipt" />
        <StatCard title="Active Users" value={stats?.total_users || 0} icon="Users" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Merchants" value={stats?.total_merchants || 0} icon="Store" />
        <StatCard title="Active Campaigns" value={stats?.active_campaigns || 0} icon="Megaphone" />
        <StatCard title="Active Coupons" value={stats?.active_coupons || 0} icon="Ticket" />
      </div>
    </div>
  );
}
