import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Match", "Interesse", "Visita", "Negociação"];

export function MatchTimeline({ step }: { step: 1 | 2 | 3 | 4 }) {
  return (
    <div className="flex items-center gap-1.5">
      {STEPS.map((label, i) => {
        const idx = i + 1;
        const done = idx <= step;
        const current = idx === step;
        return (
          <div key={label} className="flex flex-1 items-center gap-1.5">
            <div
              className={cn(
                "grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-bold transition",
                done
                  ? "bg-gradient-primary text-primary-foreground shadow-float"
                  : "bg-secondary text-muted-foreground",
                current && "ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
              )}
            >
              {done && !current ? <Check className="h-3 w-3" /> : idx}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 rounded-full",
                  idx < step ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
