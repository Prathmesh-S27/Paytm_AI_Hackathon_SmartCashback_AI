import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
      primary: "bg-gradient-primary text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40",
      secondary: "bg-slate-700 text-white hover:bg-slate-600",
      danger: "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/25",
      outline: "border border-slate-600 text-slate-300 hover:bg-slate-800",
      ghost: "text-slate-300 hover:bg-slate-800 hover:text-white",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 py-2 text-sm",
      lg: "h-12 px-8 text-base",
      icon: "h-10 w-10",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
