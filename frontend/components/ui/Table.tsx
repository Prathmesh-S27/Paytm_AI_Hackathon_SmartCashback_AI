import { ReactNode } from "react";

export function Table({ children }: { children?: ReactNode }) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-slate-700/50 bg-slate-800/50">
      <table className="w-full text-sm text-left">{children}</table>
    </div>
  );
}

export function TableHeader({ children }: { children?: ReactNode }) {
  return <thead className="text-xs text-slate-400 uppercase bg-slate-900/50 border-b border-slate-700/50">{children}</thead>;
}

export function TableRow({ children, className = "", onClick }: { children?: ReactNode; className?: string; onClick?: () => void }) {
  return <tr className={`border-b border-slate-700/50 hover:bg-slate-800/80 transition-colors ${className}`} onClick={onClick}>{children}</tr>;
}

export function TableHead({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return <th className={`px-6 py-4 font-medium ${className}`}>{children}</th>;
}

export function TableCell({ children, className = "", colSpan }: { children?: ReactNode; className?: string; colSpan?: number }) {
  return <td className={`px-6 py-4 ${className}`} colSpan={colSpan}>{children}</td>;
}

export function TableBody({ children }: { children?: ReactNode }) {
  return <tbody>{children}</tbody>;
}
