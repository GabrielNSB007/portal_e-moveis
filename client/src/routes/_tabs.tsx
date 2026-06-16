import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { BottomNavigation, tabs } from "@/components/emoveis/BottomNavigation";
import { Logo } from "@/components/emoveis/Logo";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/_tabs")({
  component: TabsLayout,
});

function TabsLayout() {
  // Estado para controlar se a barra lateral está recolhida
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* Passamos o estado e a função para a navegação desktop */}
      <DesktopNavigation isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      
      {/* O preenchimento da esquerda (padding-left) agora se adapta dinamicamente */}
      <div 
        className={cn(
          "min-w-0 transition-all duration-300", 
          isCollapsed ? "lg:pl-[76px]" : "lg:pl-[248px]"
        )}
      >
        <main className="mx-auto min-h-dvh w-full max-w-[1440px] pb-24 lg:pb-0">
          <Outlet />
        </main>
        <BottomNavigation />
      </div>
    </div>
  );
}

function DesktopNavigation({ 
  isCollapsed, 
  onToggle 
}: { 
  isCollapsed: boolean; 
  onToggle: () => void 
}) {
  const { pathname } = useLocation();

  return (
    <aside 
      className={cn(
        "fixed inset-y-0 left-0 z-30 hidden border-r border-border/80 bg-card/85 py-5 backdrop-blur-xl lg:flex flex-col transition-all duration-300 group",
        isCollapsed ? "w-[76px] px-3" : "w-[248px] px-4"
      )}
    >
      {/* Botão de abrir/fechar flutuante na borda direita (aparece mais visível no hover da sidebar) */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-7 z-40 hidden h-6 w-6 place-items-center rounded-full border border-border bg-card shadow-soft text-muted-foreground transition-all hover:bg-secondary hover:text-foreground lg:grid"
        aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      {/* Logo: Esconde os detalhes em texto se estiver recolhido */}
      <div className={cn("overflow-hidden transition-all duration-300", isCollapsed ? "px-1.5" : "px-2")}>
        <Logo className="w-full" iconOnly={isCollapsed} />
      </div>

      {/* Links de Navegação */}
      <nav className="mt-8 space-y-1 flex-1">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.to);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.to}
              to={tab.to}
              title={isCollapsed ? tab.label : undefined} // Tooltip se estiver recolhido
              className={cn(
                "flex h-11 items-center rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden",
                isCollapsed ? "justify-center px-0 w-11 mx-auto" : "gap-3 px-3 w-full",
                active
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={active ? 2.4 : 1.9} />
              
              {/* O texto some suavemente baseando-se na largura e opacidade */}
              <span 
                className={cn(
                  "transition-all duration-300 whitespace-nowrap",
                  isCollapsed ? "w-0 opacity-0 pointer-events-none" : "w-auto opacity-100"
                )}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Card Informativo Inferior (Escondido se estiver recolhido) */}
      <div 
        className={cn(
          "rounded-2xl border border-primary/20 bg-primary/5 p-4 transition-all duration-300 overflow-hidden",
          isCollapsed ? "h-0 p-0 border-0 opacity-0 scale-95" : "h-auto opacity-100"
        )}
      >
        <div className="text-xs font-semibold text-primary whitespace-nowrap">Matchmaking inteligente</div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Contatos externos só aparecem depois de interesse mútuo.
        </p>
      </div>
    </aside>
  );
}