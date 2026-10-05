"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatCurrency, getCategoryColor } from "@/lib/utils";

interface DataItem {
  category: string;
  total_spend: number;
}

interface Props {
  data: DataItem[];
}

export function SpendingPieChart({ data }: Props) {
  if (!data || data.length === 0) return <div className="h-[300px] flex items-center justify-center text-slate-400">No data available</div>;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl">
          <p className="text-sm font-medium mb-1">{payload[0].name}</p>
          <p className="text-sm text-slate-300">
            Total Spend: <span className="font-bold text-white">{formatCurrency(payload[0].value)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="total_spend"
            nameKey="category"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getCategoryColor(entry.category)} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px', color: '#94A3B8' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
