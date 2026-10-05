import { Card } from "./Card";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  change?: number;
  className?: string;
}

export function StatCard({ title, value, icon, change, className }: StatCardProps) {
  const IconComponent = (Icons as any)[icon] || Icons.Circle;

  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <h3 className="text-2xl font-bold mt-1 text-slate-50">{value}</h3>
        </div>
        <div className="h-12 w-12 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
          <IconComponent size={24} />
        </div>
      </div>
      {change !== undefined && (
        <div className="mt-4 flex items-center text-sm">
          {change > 0 ? (
            <span className="flex items-center text-emerald-400">
              <Icons.ArrowUpRight size={16} className="mr-1" />
              +{change}%
            </span>
          ) : change < 0 ? (
            <span className="flex items-center text-red-400">
              <Icons.ArrowDownRight size={16} className="mr-1" />
              {change}%
            </span>
          ) : (
            <span className="flex items-center text-slate-400">0%</span>
          )}
          <span className="text-slate-500 ml-2">vs last month</span>
        </div>
      )}
    </Card>
  );
}
