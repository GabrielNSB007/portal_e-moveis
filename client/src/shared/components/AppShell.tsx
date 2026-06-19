import type { ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Bell, Building2, Compass, Handshake, Home, LogOut, Menu, MessageSquareText, Sparkles, UserRound } from "lucide-react";
import { useAuth } from "@/modules/auth/components/AuthProvider";
import { cn } from "@/shared/utils/cn";
import logoSrc from "@/assets/logo.png";

type AppShellProps = {
  children: ReactNode;
};

const buyerNavItems = [
  { to: "/discover", label: "Descobrir", icon: Home },
  { to: "/matches", label: "Matches", icon: Compass },
  { to: "/preferences", label: "Interesses", icon: Handshake },
  { to: "/proposals", label: "Propostas", icon: MessageSquareText },
  { to: "/notifications", label: "Alertas", icon: Bell },
  { to: "/profile", label: "Perfil", icon: UserRound },
];

const sellerNavItems = [
  { to: "/discover", label: "Descobrir", icon: Home },
  { to: "/advertiser", label: "Ofertas", icon: Building2 },
  { to: "/proposals", label: "Propostas", icon: Handshake },
  { to: "/notifications", label: "Alertas", icon: Bell },
  { to: "/profile", label: "Perfil", icon: UserRound },
];

export function AppShell({ children }: AppShellProps) {
  const { user, logout, profileMode, setProfileMode, canUseSeller } = useAuth();
  const navigate = useNavigate();
  const navItems = profileMode === "seller" ? sellerNavItems : buyerNavItems;

  function handleLogout() {
    logout();
    navigate("/auth/login", { replace: true });
  }

  function switchArea() {
    if (profileMode === "seller") {
      setProfileMode("buyer");
      navigate("/discover");
      return;
    }

    if (canUseSeller) {
      setProfileMode("seller");
    }
    navigate("/advertiser");
  }

  return (
    <div className="min-h-screen bg-[#f7f7fb] lg:grid lg:grid-cols-[270px_1fr] xl:grid-cols-[280px_1fr]">
      <aside className="sticky top-0 hidden h-screen border-r border-border bg-card px-4 py-4 lg:flex lg:flex-col">
        <Link to="/discover" className="flex items-center gap-2 font-display text-[15px] font-black text-foreground">
          <span className="grid size-10 shrink-0 place-items-center text-primary">
            <img src={logoSrc} alt="Portal E-móveis" className="size-9 object-contain" />
          </span>
          <span className="whitespace-nowrap">
            Portal <strong className="text-primary">E-móveis</strong>
          </span>
        </Link>

        <nav className="mt-8 grid gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-extrabold transition",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )
                }
              >
                <Icon className="size-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto grid gap-2.5 pt-5">
          <button
            type="button"
            onClick={switchArea}
            className="flex h-10 items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-3 text-primary-foreground shadow-md shadow-primary/20 transition hover:-translate-y-0.5"
          >
            <Sparkles className="size-4 shrink-0" />
            <span className="text-xs font-black">{profileMode === "seller" ? "Área do comprador" : "Área de vendedor"}</span>
            <span className="text-sm">→</span>
          </button>

          <div className="rounded-2xl border border-border bg-secondary/60 px-3 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-xs font-extrabold text-foreground">{user?.name ?? "Usuário"}</p>
                <p className="mt-0.5 text-[11px] font-semibold text-muted-foreground">{profileMode === "seller" ? "Vendedor" : "Comprador"}</p>
              </div>
              <button
                type="button"
                className="grid size-8 shrink-0 place-items-center rounded-xl text-muted-foreground transition hover:bg-card hover:text-destructive"
                onClick={handleLogout}
                aria-label="Sair"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-40 border-b border-border bg-card/90 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between">
            <Link to="/discover" className="flex items-center gap-2 font-display text-lg font-black text-foreground">
              <span className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                <img src={logoSrc} alt="Portal E-móveis" className="size-8 object-contain" />
              </span>
              Portal <strong className="text-primary">E-móveis</strong>
            </Link>
            <Menu className="size-5 text-muted-foreground" />
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:px-7 lg:py-7 xl:px-8">{children}</main>

        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-2 py-2 backdrop-blur lg:hidden">
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))` }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.to} to={item.to} className={({ isActive }) => mobileNavClass(isActive)}>
                  <Icon className="size-5" />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

function mobileNavClass(isActive: boolean) {
  return cn(
    "flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[10px] font-bold transition",
    isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
  );
}
