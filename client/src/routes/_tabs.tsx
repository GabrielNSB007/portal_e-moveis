import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { BottomNavigation, tabs } from "@/components/emoveis/BottomNavigation";
import { Logo } from "@/components/emoveis/Logo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_tabs")({
  component: TabsLayout,
});

function TabsLayout() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <DesktopNavigation />
      <div className="min-w-0 lg:pl-[248px]">
        <main className="mx-auto min-h-dvh w-full max-w-[1440px] pb-24 lg:pb-0">
          <Outlet />
        </main>
        <BottomNavigation />
      </div>
    </div>
  );
}

function DesktopNavigation() {
  const { pathname } = useLocation();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] border-r border-border/80 bg-card/85 px-4 py-5 backdrop-blur-xl lg:block">
      <Logo className="px-2" />
      <nav className="mt-8 space-y-1">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.to);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={cn(
                "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition",
                active
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={active ? 2.4 : 1.9} />
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-5 left-4 right-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
        <div className="text-xs font-semibold text-primary">Matchmaking inteligente</div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Contatos externos só aparecem depois de interesse mútuo.
        </p>
      </div>
    </aside>
  );
}
