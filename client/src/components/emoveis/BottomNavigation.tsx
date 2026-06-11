import { Link, useLocation } from "@tanstack/react-router";
import { Bell, Compass, Handshake, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const tabs = [
  { to: "/explore", label: "Explorar", icon: Compass },
  { to: "/interesses", label: "Interesses", icon: Handshake },
  { to: "/alertas", label: "Alertas", icon: Bell },
  { to: "/profile", label: "Perfil", icon: User },
] as const;

export function BottomNavigation() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-xl safe-bottom lg:hidden">
      <div className="mx-auto flex max-w-2xl items-stretch justify-around px-2 pt-1">
        {tabs.map((t) => {
          const active = pathname.startsWith(t.to);
          const Icon = t.icon;
          return (
            <Link
              key={t.to}
              to={t.to}
              className="relative flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-medium"
            >
              {active && (
                <motion.span
                  layoutId="tab-pill"
                  className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <Icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
                strokeWidth={active ? 2.4 : 1.8}
              />
              <span className={cn(active ? "text-foreground" : "text-muted-foreground")}>
                {t.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
