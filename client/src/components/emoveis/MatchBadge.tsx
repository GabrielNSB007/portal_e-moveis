import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function MatchBadge({
  value,
  className,
  variant = "solid",
}: {
  value: number;
  className?: string;
  variant?: "solid" | "soft";
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        variant === "solid"
          ? "bg-card/95 text-foreground shadow-soft backdrop-blur-md"
          : "bg-primary/10 text-primary",
        className
      )}
    >
      <Sparkles className="h-3 w-3 text-primary" />
      <span>{value}%</span>
      <span className="text-muted-foreground">match</span>
    </div>
  );
}
