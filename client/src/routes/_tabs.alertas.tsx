import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { alerts, propertyById, type Alert, type AlertType, type Property } from "@/mock/data";
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
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { mapOfferToProperty } from "@/lib/offer-mappers";
import { listNotifications, markAllNotificationsRead } from "@/services/notifications";

export const Route = createFileRoute("/_tabs/alertas")({
  component: Alertas,
});

const ICONS: Record<AlertType, { icon: any; tone: string }> = {
  match: { icon: Sparkles, tone: "bg-success/15 text-success" },
  interest_received: { icon: Inbox, tone: "bg-primary/15 text-primary" },
  proposal: { icon: HandCoins, tone: "bg-warning/15 text-warning" },
  price_drop: { icon: TrendingDown, tone: "bg-accent/15 text-accent-foreground" },
  new_compatible: { icon: Building2, tone: "bg-primary/10 text-primary" },
  interest_sent: { icon: Send, tone: "bg-muted text-muted-foreground" },
};

type DisplayAlert = Alert & { property?: Property };

const notificationType = (type: string): AlertType => {
  if (type === "match") return "match";
  if (type === "proposal") return "proposal";
  if (type === "interest_sent") return "interest_sent";
  if (type === "interest_received") return "interest_received";
  return "new_compatible";
};

const notificationGroup = (createdAt: string): DisplayAlert["group"] => {
  const date = new Date(createdAt);
  const now = new Date();
  if (Number.isNaN(date.getTime())) return "Hoje";
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diffDays <= 0) return "Hoje";
  if (diffDays === 1) return "Ontem";
  return "Esta semana";
};

const notificationTime = (createdAt: string) => {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "agora";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(date);
};

function Alertas() {
  const [items, setItems] = useState<DisplayAlert[]>([]);

  const unread = items.filter((a) => !a.read).length;

  useEffect(() => {
    let active = true;

    listNotifications()
      .then(({ data }) => {
        if (!active) return;
        setItems(
          data.map((item, index) => ({
            id: item.id,
            type: notificationType(item.type),
            title: item.title,
            description: item.description,
            time: notificationTime(item.createdAt),
            group: notificationGroup(item.createdAt),
            propertyId: item.offerId ?? undefined,
            property: item.offer ? mapOfferToProperty(item.offer, index) : undefined,
            read: item.read,
          })),
        );
      })
      .catch(() => {
        if (active) setItems(alerts);
      });

    return () => {
      active = false;
    };
  }, []);

  const grouped = useMemo(() => {
    const g: Record<string, Alert[]> = { Hoje: [], Ontem: [], "Esta semana": [] };
    items.forEach((a) => g[a.group].push(a));
    return g;
  }, [items]);

  const markAll = async () => {
    setItems((arr) => arr.map((a) => ({ ...a, read: true })));
    try {
      await markAllNotificationsRead();
    } catch {
      // Mantem otimista; a proxima carga sincroniza novamente.
    }
  };

  return (
    <div className="mx-auto pb-24 lg:max-w-[800px] lg:px-8 lg:py-8 lg:pb-12">
      
      {/* HEADER DESKTOP E MOBILE */}
      <header className="safe-top sticky top-0 z-30 border-b border-border/60 bg-background/95 px-5 pb-4 pt-4 backdrop-blur-xl lg:static lg:mb-8 lg:rounded-[2rem] lg:border lg:border-border/50 lg:bg-card lg:p-8 lg:shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">Notificações</h1>
            <p className="mt-1 text-sm font-medium text-muted-foreground lg:text-base">
              {unread > 0 ? (
                <span className="flex items-center gap-1.5 text-primary">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
                  </span>
                  {unread} {unread === 1 ? 'alerta não lido' : 'alertas não lidos'}
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-success" /> Tudo em dia
                </span>
              )}
            </p>
          </div>
          
          {unread > 0 && (
            <Button
              onClick={markAll}
              variant="secondary"
              size="sm"
              className="hidden items-center gap-2 rounded-xl font-bold lg:flex"
            >
              <Check className="h-4 w-4" />
              Marcar todos como lidos
            </Button>
          )}

          {/* Botão Mobile */}
          {unread > 0 && (
            <button
              onClick={markAll}
              className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-muted-foreground transition active:scale-95 lg:hidden"
              aria-label="Marcar lidos"
            >
              <Check className="h-5 w-5" />
            </button>
          )}
        </div>
      </header>

      {items.length === 0 ? (
        <div className="mt-12 lg:mt-24">
          <EmptyState icon={Bell} title="Sem alertas" description="Sua caixa de entrada está limpa. Avisaremos quando houver novidades!" />
        </div>
      ) : (
        <div className="space-y-6 p-5 lg:space-y-8 lg:p-0">
          {(["Hoje", "Ontem", "Esta semana"] as const).map(
            (group) =>
              grouped[group].length > 0 && (
                <section key={group}>
                  <h2 className="mb-3 px-2 text-xs font-bold uppercase tracking-wider text-muted-foreground lg:text-sm">
                    {group}
                  </h2>
                  <div className="overflow-hidden rounded-3xl border border-border/50 bg-card shadow-sm">
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

function AlertRow({ alert, delay }: { alert: DisplayAlert; delay: number }) {
  const meta = ICONS[alert.type];
  const p = alert.property ?? (alert.propertyId ? propertyById(alert.propertyId) : null);

  const body = (
    <div
      className={cn(
        "group flex items-start gap-4 border-b border-border/50 px-5 py-4 transition-colors last:border-b-0 hover:bg-secondary/40 lg:px-6 lg:py-5",
        !alert.read && "bg-primary/[0.03] hover:bg-primary/[0.05]"
      )}
    >
      <div className={cn("relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl lg:h-14 lg:w-14 lg:rounded-[1.25rem]", meta.tone)}>
        <meta.icon className="h-5 w-5 lg:h-6 lg:w-6" />
        {!alert.read && (
          <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-[3px] border-card bg-primary lg:h-4 lg:w-4 lg:border-4" />
        )}
      </div>
      
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className={cn("truncate text-sm font-bold lg:text-base", !alert.read ? "text-foreground" : "text-foreground/80")}>
            {alert.title}
          </h3>
          <span className="shrink-0 text-[11px] font-medium text-muted-foreground lg:text-xs">
            {alert.time}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground lg:text-sm">
          {alert.description}
        </p>
      </div>

      {p && (
        <div className="relative shrink-0 overflow-hidden rounded-xl border border-border lg:h-16 lg:w-16">
          <img
            src={p.images[0]}
            alt=""
            className="h-12 w-12 object-cover transition-transform duration-300 group-hover:scale-110 lg:h-full lg:w-full"
          />
        </div>
      )}
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
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
