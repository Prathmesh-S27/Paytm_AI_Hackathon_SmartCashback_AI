"use client";

import { useEffect, useState } from "react";
import { RecommendationLog } from "@/types";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<RecommendationLog[]>([]);

  useEffect(() => {
    api.getRecommendationLogs().then(res => setLogs(res)).catch(console.error);
  }, []);

  return (
    <div className="animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <p className="text-slate-400">Raw logs of all recommendation engine evaluations.</p>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Log ID</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Context Tx</TableHead>
              <TableHead>Candidate</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Decision</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-xs text-slate-400">{formatDate(log.created_at)}</TableCell>
                <TableCell className="text-xs font-mono">{log.id.substring(0,8)}</TableCell>
                <TableCell className="text-xs font-mono">{log.user_id.substring(0,8)}</TableCell>
                <TableCell className="text-xs font-mono">{log.transaction_id.substring(0,8)}</TableCell>
                <TableCell className="text-xs font-mono">{log.candidate_merchant_id.substring(0,8)}</TableCell>
                <TableCell>{log.final_score.toFixed(1)}</TableCell>
                <TableCell>
                  <Badge variant={log.final_decision === 'recommended' ? 'success' : log.final_decision === 'filtered' ? 'warning' : 'danger'}>
                    {log.final_decision}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
