import logo from "@/assets/logo.png";
import logoDark from "@/assets/logo_dark.png";
import { cn } from "@/lib/utils";

export function Logo({ 
  className, 
  withWordmark = false,
  iconOnly = false // Adicionamos a propriedade para controlar a sanfona
}: { 
  className?: string; 
  withWordmark?: boolean;
  iconOnly?: boolean;
}) {
  if (withWordmark) {
    return (
      <>
        <img src={logo} alt="Portal E-moveis" className={cn("h-12 w-auto dark:hidden", className)} />
        <img src={logoDark} alt="Portal E-moveis" className={cn("hidden h-12 w-auto dark:block", className)} />
      </>
    );
  }

  return (
    <div className={cn("flex items-center gap-2 overflow-hidden", className)}>
      {/* O shrink-0 garante que o ícone nunca seja espremido */}
      <img src={logo} alt="E-moveis" className="h-8 w-8 shrink-0 object-contain dark:hidden" />
      <img src={logoDark} alt="E-moveis" className="hidden h-8 w-8 shrink-0 object-contain dark:block" />
      
      <span 
        className={cn(
          "text-base font-bold tracking-tight whitespace-nowrap transition-all duration-300",
          iconOnly ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100"
        )}
      >
        Portal <span className="text-primary">E-moveis</span>
      </span>
    </div>
  );
}
