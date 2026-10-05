"use client";

import React, { useEffect, useState } from "react";
import { RecommendationLog, Merchant } from "@/types";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { formatDate, formatCurrency } from "@/lib/utils";
import { ChevronDown, ChevronRight, BrainCircuit, Search, Filter, MapPin } from "lucide-react";
import dynamic from 'next/dynamic';

const TransactionMap = dynamic(() => import('@/components/map/TransactionMap'), { ssr: false });

export default function AdminDecisionEngine() {
  const [logs, setLogs] = useState<RecommendationLog[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    
    // Fetch logs and merchants in parallel
    const params = categoryFilter ? `category=${categoryFilter}` : "";
    Promise.all([
      api.getRecommendationLogs(params),
      api.getMerchants()
    ])
      .then(([logsRes, merchantsRes]) => {
        setLogs(logsRes);
        setMerchants(merchantsRes);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [categoryFilter]);

  // Convert 0-1 float to 0-100 percentage for display
  const toPercent = (val: number) => Math.round(val * 100);

  const groupedLogs = React.useMemo(() => {
    const groups: Record<string, RecommendationLog[]> = {};
    logs.forEach(log => {
      if (!groups[log.transaction_id]) groups[log.transaction_id] = [];
      groups[log.transaction_id].push(log);
    });
    
    // Convert to array and sort each group
    return Object.values(groups).map(group => {
      group.sort((a, b) => b.final_score - a.final_score);
      return group;
    }).sort((a, b) => new Date(b[0].created_at).getTime() - new Date(a[0].created_at).getTime());
  }, [logs]);

  if (loading) {
    return (
      <div className="animate-fadeIn pb-10">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-8">
          <BrainCircuit className="text-violet-400" /> Decision Engine Output
        </h1>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BrainCircuit className="text-violet-400" /> Recommendation Decision Engine
        </h1>
        <p className="text-slate-400 mt-1">Inspect exactly how the AI evaluates, scores, and ranks merchants for each recommendation decision.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2 border border-slate-700">
          <Filter size={16} className="text-slate-400" />
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-transparent text-sm text-slate-300 border-none outline-none"
          >
            <option value="">All Categories</option>
            {["Restaurant", "Cafe", "Clothing", "Footwear", "Electronics", "Grocery", "Ice Cream", "Fast Food"].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="text-sm text-slate-500 flex items-center">
          {logs.length} recommendation log{logs.length !== 1 ? "s" : ""}
        </div>
      </div>

      {logs.length === 0 ? (
        <Card className="p-12 text-center">
          <BrainCircuit size={48} className="text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No recommendation logs found. Make a payment to generate recommendations.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>User Avg Spend</TableHead>
                <TableHead>Recommendations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupedLogs.map((group) => {
                const mainLog = group[0];
                const topRecs = group.filter(l => l.final_decision === 'recommended').slice(0, 3);
                
                return (
                <React.Fragment key={mainLog.transaction_id}>
                  <TableRow 
                    className="cursor-pointer hover:bg-slate-700/30 transition-colors"
                    onClick={() => setExpandedId(expandedId === mainLog.transaction_id ? null : mainLog.transaction_id)}
                  >
                    <TableCell>
                      {expandedId === mainLog.transaction_id ? <ChevronDown size={16} className="text-indigo-400" /> : <ChevronRight size={16} className="text-slate-500" />}
                    </TableCell>
                    <TableCell className="text-xs text-slate-400">{formatDate(mainLog.created_at)}</TableCell>
                    <TableCell className="text-xs font-mono text-slate-500">{mainLog.transaction_id.substring(0, 8)}...</TableCell>
                    <TableCell>
                      <Badge color="#6366F1">{mainLog.current_category}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(mainLog.user_category_average)}</TableCell>
                    <TableCell>
                      <Badge variant="success">{topRecs.length} Generated</Badge>
                    </TableCell>
                  </TableRow>
                  
                  {expandedId === mainLog.transaction_id && (() => {
                    const originMerchant = merchants.find(m => m.id === mainLog.current_merchant_id);
                    const candidateMerchants = topRecs.map(r => merchants.find(m => m.id === r.candidate_merchant_id)).filter(Boolean) as Merchant[];

                    return (
                    <TableRow className="bg-slate-900/80">
                      <TableCell colSpan={6} className="p-0 border-b border-slate-700">
                        <div className="p-6">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                              <h4 className="font-bold text-indigo-400 uppercase tracking-wider text-sm mb-4">
                                Top 3 Recommendations & Rationale
                              </h4>
                              <div className="space-y-6">
                                {topRecs.map((rec, idx) => (
                                  <div key={rec.id} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                    <div className="flex flex-col md:flex-row justify-between items-start mb-4 border-b border-slate-700/50 pb-4">
                                      <div>
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="text-2xl font-bold text-slate-300">#{idx + 1}</span>
                                          <Badge color="#8B5CF6">{rec.candidate_category}</Badge>
                                        </div>
                                        <div className="text-sm text-slate-300 mt-2">
                                          {rec.gemini_reason || "Calculated deterministically based on context variables."}
                                        </div>
                                      </div>
                                      <div className="text-right mt-4 md:mt-0">
                                        <div className="text-xs text-slate-500 mb-1">Match Rate</div>
                                        <span className={`font-bold text-2xl ${
                                          toPercent(rec.final_score) >= 80 ? 'text-emerald-400' : 
                                          toPercent(rec.final_score) >= 60 ? 'text-amber-400' : 'text-red-400'
                                        }`}>
                                          {toPercent(rec.final_score)}%
                                        </span>
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                                      <div>
                                        <span className="text-slate-500 block mb-1">Category Rel.</span>
                                        <ScoreBar score={toPercent(rec.category_score)} />
                                      </div>
                                      <div>
                                        <span className="text-slate-500 block mb-1">Price Sim.</span>
                                        <ScoreBar score={toPercent(rec.price_similarity)} />
                                      </div>
                                      <div>
                                        <span className="text-slate-500 block mb-1">User History</span>
                                        <ScoreBar score={toPercent(rec.history_score)} />
                                      </div>
                                      <div>
                                        <span className="text-slate-500 block mb-1">Distance ({rec.distance_km.toFixed(1)}km)</span>
                                        <ScoreBar score={Math.round((1 - rec.distance_km / 5) * 100)} />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            {/* Geographical Context */}
                            <div className="lg:col-span-1">
                              <h4 className="font-bold text-indigo-400 uppercase tracking-wider text-sm mb-4 flex items-center gap-2">
                                <MapPin size={16} /> Geographical Context
                              </h4>
                              {originMerchant ? (
                                <div className="space-y-4">
                                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                    <div className="text-sm text-slate-400 mb-1">Transaction Origin</div>
                                    <div className="font-bold text-slate-200">{originMerchant.name}</div>
                                    <div className="text-xs text-slate-500 font-mono mt-2">
                                      {originMerchant.latitude.toFixed(6)}, {originMerchant.longitude.toFixed(6)}
                                    </div>
                                    <div className="text-xs text-indigo-400 mt-2">Search Radius: 5.0 km</div>
                                  </div>
                                  
                                  <TransactionMap 
                                    originMerchant={originMerchant} 
                                    candidates={candidateMerchants}
                                    radiusKm={5.0}
                                  />
                                </div>
                              ) : (
                                <div className="text-slate-500 text-sm">Location data unavailable.</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                    );
                  })()}
                </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
