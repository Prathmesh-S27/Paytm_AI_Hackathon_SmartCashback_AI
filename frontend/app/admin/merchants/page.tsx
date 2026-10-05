"use client";

import { useEffect, useState } from "react";
import { Merchant } from "@/types";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { getCategoryColor } from "@/lib/utils";

export default function AdminMerchants() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);

  useEffect(() => {
    api.getMerchants().then(res => setMerchants(res)).catch(console.error);
  }, []);

  return (
    <div className="animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Merchants</h1>
        <p className="text-slate-400">Manage all registered merchants.</p>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Avg Bill</TableHead>
              <TableHead>Cashback %</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {merchants.map(m => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{m.name}</TableCell>
                <TableCell><Badge color={getCategoryColor(m.category)}>{m.category}</Badge></TableCell>
                <TableCell>₹{m.average_bill}</TableCell>
                <TableCell>{m.cashback_percentage}%</TableCell>
                <TableCell>
                  <Badge variant={m.active ? "success" : "danger"}>{m.active ? "Active" : "Inactive"}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
