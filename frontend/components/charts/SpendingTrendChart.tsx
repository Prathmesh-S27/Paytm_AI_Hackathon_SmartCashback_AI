"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface Props {
  data: { date: string; amount: number }[];
}

export function SpendingTrendChart({ data }: Props) {
  if (!data || data.length === 0) return <div className="h-[300px] flex items-center justify-center text-slate-400">No data available</div>;

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#94A3B8" 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => {
              const d = new Date(value);
              return `${d.getDate()}/${d.getMonth()+1}`;
            }}
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
            formatter={(value: number) => [formatCurrency(value), 'Spend']}
            labelFormatter={(label) => new Date(label).toLocaleDateString()}
          />
          <Area 
            type="monotone" 
            dataKey="amount" 
            stroke="#6366F1" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorAmount)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
