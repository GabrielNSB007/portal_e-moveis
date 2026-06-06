import logo from "@/assets/logo.svg";
import { cn } from "@/lib/utils";

export function Logo({ className, withWordmark = false }: { className?: string; withWordmark?: boolean }) {
  if (withWordmark) {
    return <img src={logo} alt="Portal E-moveis" className={cn("h-12 w-auto", className)} />;
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img src={logo} alt="E-moveis" className="h-8 w-8 object-contain" />
      <span className="text-base font-bold tracking-tight">
        Portal <span className="text-primary">E-moveis</span>
      </span>
    </div>
  );
}
