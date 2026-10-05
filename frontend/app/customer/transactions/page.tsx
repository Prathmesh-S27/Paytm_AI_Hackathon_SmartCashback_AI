"use client";

import { useEffect, useState } from "react";
import { Transaction } from "@/types";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { formatCurrency, formatDate, getCategoryColor } from "@/lib/utils";

export default function TransactionsPage() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (user.id) {
      api.getUserTransactions(user.id).then(res => {
        setTransactions(res);
      }).catch(err => console.error(err)).finally(() => setLoading(false));
    }
  }, []);

  return (
    <div className="animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Transaction History</h1>
        <p className="text-slate-400">View all your past transactions and earned discounts.</p>
      </div>

      <Card>
        {loading ? (
          <div className="p-6"><SkeletonCard/></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
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
                  <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                    No transactions found. Make a payment to see it here.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-xs text-slate-500 font-mono">{tx.id.substring(0,8)}</TableCell>
                    <TableCell className="text-slate-300">{formatDate(tx.created_at)}</TableCell>
                    <TableCell className="font-medium text-slate-100">{tx.merchant?.name || tx.merchant_id}</TableCell>
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
        )}
      </Card>
    </div>
  );
}
