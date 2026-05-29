import { cn } from "@/lib/utils";

export function Logo({ className, withWordmark = false }: { className?: string; withWordmark?: boolean }) {
  if (withWordmark) {
    return <img src="/favicon.svg" alt="Portal E-móveis" className={cn("h-12 w-auto", className)} />;
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img src="/favicon.svg" alt="E-móveis" className="h-8 w-8 object-contain" />
      <span className="text-base font-bold tracking-tight">
        Portal <span className="text-primary">E-móveis</span>
      </span>
    </div>
  );
}
