import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { BottomNavigation, tabs } from "@/components/emoveis/BottomNavigation";
import { Logo } from "@/components/emoveis/Logo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_tabs")({
  component: TabsLayout,
});

function TabsLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <DesktopNavigation isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />

      <div
        className={cn(
          "min-w-0 transition-all duration-300",
          isCollapsed ? "lg:pl-[76px]" : "lg:pl-[248px]",
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
  onToggle,
}: {
  isCollapsed: boolean;
  onToggle: () => void;
}) {
  const { pathname } = useLocation();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-border/80 bg-card/85 py-5 backdrop-blur-xl transition-all duration-300 lg:flex",
        isCollapsed ? "w-[76px] px-3" : "w-[248px] px-4",
      )}
    >
      <button
        onClick={onToggle}
        className="absolute -right-3 top-7 z-40 hidden h-6 w-6 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-soft transition-all hover:bg-secondary hover:text-foreground lg:grid"
        aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      <div className={cn("overflow-hidden transition-all duration-300", isCollapsed ? "px-1.5" : "px-2")}>
        <Logo className="w-full" iconOnly={isCollapsed} />
      </div>

      <nav className="mt-8 flex-1 space-y-1">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.to);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.to}
              to={tab.to}
              title={isCollapsed ? tab.label : undefined}
              className={cn(
                "flex h-11 items-center overflow-hidden rounded-xl text-sm font-medium transition-all duration-300",
                isCollapsed ? "mx-auto w-11 justify-center px-0" : "w-full gap-3 px-3",
                active
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={active ? 2.4 : 1.9} />
              <span
                className={cn(
                  "whitespace-nowrap transition-all duration-300",
                  isCollapsed ? "pointer-events-none w-0 opacity-0" : "w-auto opacity-100",
                )}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <Link
        to="/agent"
        className={cn(
          "group block overflow-hidden rounded-2xl bg-primary p-4 text-primary-foreground shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float active:translate-y-0",
          isCollapsed ? "h-0 scale-95 border-0 p-0 opacity-0" : "h-auto opacity-100",
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-foreground/15">
            <Building2 className="h-5 w-5" />
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
        </div>
        <div className="mt-3 whitespace-nowrap text-sm font-bold">
          Area do anunciante
        </div>
        <p className="mt-1 text-xs leading-relaxed text-primary-foreground/80">
          Criar e gerenciar anuncios
        </p>
      </Link>
    </aside>
  );
}
