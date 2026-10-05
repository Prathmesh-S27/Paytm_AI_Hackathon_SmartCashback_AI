import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse bg-slate-800 rounded-md", className)} />
  );
}

export function SkeletonCard() {
  return (
    <div className="glass-card p-6 w-full space-y-4">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-20 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );
}
