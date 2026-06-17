import { cn } from "@/lib/utils";

export function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-gradient-to-r from-muted via-secondary to-muted",
        className
      )}
    />
  );
}

export function PropertySkeleton() {
  return (
    <div className="space-y-3 rounded-3xl bg-card p-3 shadow-soft">
      <Shimmer className="h-48 w-full rounded-2xl" />
      <Shimmer className="h-4 w-2/3" />
      <Shimmer className="h-3 w-1/3" />
    </div>
  );
}
