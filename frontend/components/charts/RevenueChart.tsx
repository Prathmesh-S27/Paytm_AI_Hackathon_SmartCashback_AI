"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

export function RevenueChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return <div className="h-[300px] flex items-center justify-center text-slate-400">No data available</div>;

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#94A3B8" 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#94A3B8" 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `₹${value}`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1E293B', borderColor: '#475569', borderRadius: '8px' }}
            itemStyle={{ color: '#F8FAFC' }}
            formatter={(value: number) => [formatCurrency(value), 'Revenue']}
          />
          <Bar dataKey="amount" fill="#10B981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
