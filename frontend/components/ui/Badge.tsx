import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "outline";
  className?: string;
  color?: string;
}

export function Badge({ children, variant = "default", className, color }: BadgeProps) {
  const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors";
  
  const variants = {
    default: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    danger: "bg-red-500/10 text-red-400 border border-red-500/20",
    outline: "text-slate-300 border border-slate-600",
  };

  const customStyle = color ? { backgroundColor: `${color}1A`, color, borderColor: `${color}33` } : {};

  return (
    <div 
      className={cn(baseStyles, !color && variants[variant], className)}
      style={customStyle}
    >
      {children}
    </div>
  );
}
