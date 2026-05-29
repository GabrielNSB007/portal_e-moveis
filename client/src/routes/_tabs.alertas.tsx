import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { alerts, propertyById, type Alert, type AlertType } from "@/mock/data";
import { EmptyState } from "@/components/emoveis/EmptyState";
import {
  Bell,
  Sparkles,
  HandCoins,
  TrendingDown,
  Building2,
  Send,
  Inbox,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/_tabs/alertas")({
  component: Alertas,
});

const ICONS: Record<AlertType, { icon: any; tone: string }> = {
  match: { icon: Sparkles, tone: "bg-success/15 text-success" },
  interest_received: { icon: Inbox, tone: "bg-primary/15 text-primary" },
  proposal: { icon: HandCoins, tone: "bg-warning/15 text-warning" },
  price_drop: { icon: TrendingDown, tone: "bg-accent text-accent-foreground" },
  new_compatible: { icon: Building2, tone: "bg-primary/10 text-primary" },
  interest_sent: { icon: Send, tone: "bg-muted text-muted-foreground" },
};

function Alertas() {
  const [items, setItems] = useState<Alert[]>(alerts);
  const unread = items.filter((a) => !a.read).length;

  const grouped = useMemo(() => {
    const g: Record<string, Alert[]> = { Hoje: [], Ontem: [], "Esta semana": [] };
    items.forEach((a) => g[a.group].push(a));
    return g;
  }, [items]);

  const markAll = () => setItems((arr) => arr.map((a) => ({ ...a, read: true })));

  return (
    <div className="pb-2 lg:px-8 lg:py-6">
      <header className="safe-top sticky top-0 z-30 border-b border-border/60 bg-background/95 px-4 pb-3 backdrop-blur-xl lg:static lg:mx-auto lg:max-w-3xl lg:border-0 lg:bg-transparent lg:px-0 lg:pb-6 lg:pt-0">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Alertas</h1>
            <p className="text-xs text-muted-foreground">
              {unread > 0 ? `${unread} não lidos` : "Tudo em dia"}
            </p>
          </div>
          {unread > 0 && (
            <button
              onClick={markAll}
              className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition hover:text-foreground"
            >
              <Check className="h-3 w-3" />
              Marcar lidos
            </button>
          )}
        </div>
      </header>

      {items.length === 0 ? (
        <EmptyState icon={Bell} title="Sem alertas" description="Você está em dia." />
      ) : (
        <div className="mx-auto max-w-3xl space-y-5 p-4 lg:space-y-6 lg:p-0">
          {(["Hoje", "Ontem", "Esta semana"] as const).map(
            (group) =>
              grouped[group].length > 0 && (
                <section key={group}>
                  <h2 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {group}
                  </h2>
                  <div className="overflow-hidden rounded-3xl bg-card shadow-soft">
                    {grouped[group].map((a, i) => (
                      <AlertRow key={a.id} alert={a} delay={i * 0.04} />
                    ))}
                  </div>
                </section>
              )
          )}
        </div>
      )}
    </div>
  );
}

function AlertRow({ alert, delay }: { alert: Alert; delay: number }) {
  const meta = ICONS[alert.type];
  const p = alert.propertyId ? propertyById(alert.propertyId) : null;

  const body = (
    <div
      className={cn(
        "flex items-start gap-3 border-b border-border px-4 py-3.5 transition last:border-b-0 active:bg-secondary/60",
        !alert.read && "bg-primary/[0.03]"
      )}
    >
      <div className={cn("relative grid h-10 w-10 shrink-0 place-items-center rounded-full", meta.tone)}>
        <meta.icon className="h-4 w-4" />
        {!alert.read && (
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-primary" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="line-clamp-1 text-sm font-semibold">{alert.title}</h3>
          <span className="shrink-0 text-[10px] text-muted-foreground">{alert.time}</span>
        </div>
        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {alert.description}
        </p>
      </div>
      {p && (
        <img
          src={p.images[0]}
          alt=""
          className="h-10 w-10 shrink-0 rounded-xl object-cover"
        />
      )}
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      {p ? (
        <Link to="/property/$id" params={{ id: p.id }} className="block">
          {body}
        </Link>
      ) : (
        body
      )}
    </motion.div>
  );
}
