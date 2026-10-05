import { SearchX } from "lucide-react";
import { Card } from "./Card";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Card className="p-12 flex flex-col items-center justify-center text-center border-dashed border-slate-700">
      <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mb-4">
        {icon || <SearchX size={32} />}
      </div>
      <h3 className="text-xl font-bold mb-2 text-slate-50">{title}</h3>
      <p className="text-slate-400 mb-6 max-w-md">{description}</p>
      {action}
    </Card>
  );
}
