import { ReactNode, CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  gradientBorder?: boolean;
  hoverLift?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
}

export function Card({ children, className, gradientBorder, hoverLift, onClick, style }: CardProps) {
  return (
    <div
      style={style}
      className={cn(
        "glass-card overflow-hidden",
        gradientBorder && "p-[1px] bg-gradient-to-br from-indigo-500/50 to-violet-500/50 hover:from-indigo-400 hover:to-violet-400",
        hoverLift && "hover:-translate-y-1 transition-transform duration-300 cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div className={cn(gradientBorder && "bg-slate-800 rounded-xl h-full")}>
        {children}
      </div>
    </div>
  );
}
