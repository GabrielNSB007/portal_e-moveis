import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import {
  Check,
  CheckCircle2,
  Clock,
  Eye,
  HandCoins,
  Inbox,
  Mail,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import {
  fmtCurrency,
  matches,
  propertyById,
  receivedInterests,
  sentInterests,
  type InterestStatus,
} from "@/mock/data";
import { EmptyState } from "@/components/emoveis/EmptyState";
import { MatchBadge } from "@/components/emoveis/MatchBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_tabs/interesses")({
  component: Interesses,
});

type Tab = "sent" | "received" | "matches";

const STATUS_META: Record<InterestStatus, { icon: any; label: string; tone: string; step: number }> = {
  Enviado: { icon: Send, label: "Interesse enviado", tone: "bg-muted text-muted-foreground", step: 0 },
  "Interesse enviado": { icon: Send, label: "Interesse enviado", tone: "bg-muted text-muted-foreground", step: 0 },
  Visualizado: { icon: Eye, label: "Visualizado", tone: "bg-accent text-accent-foreground", step: 1 },
  "Aguardando resposta": { icon: Clock, label: "Aguardando resposta", tone: "bg-warning/15 text-warning", step: 2 },
  "Proposta recebida": { icon: HandCoins, label: "Proposta recebida", tone: "bg-primary/15 text-primary", step: 3 },
  Match: { icon: Sparkles, label: "Match formado", tone: "bg-success/15 text-success", step: 4 },
  "Match formado": { icon: Sparkles, label: "Match formado", tone: "bg-success/15 text-success", step: 4 },
};

function Interesses() {
  const [tab, setTab] = useState<Tab>("sent");
  const counts = {
    sent: sentInterests.length,
    received: receivedInterests.length,
    matches: matches.length,
  };

  return (
    <div className="pb-2 lg:px-8 lg:py-6">
      <header className="safe-top sticky top-0 z-30 border-b border-border/60 bg-background/95 px-4 pb-3 backdrop-blur-xl lg:static lg:border-0 lg:bg-transparent lg:px-0 lg:pb-6 lg:pt-0">
        <h1 className="text-2xl font-bold tracking-tight">Interesses</h1>
        <p className="text-xs text-muted-foreground">
          Matchmaking imobiliário sem contato invasivo.
        </p>

        <div className="mt-4 flex gap-1 rounded-2xl bg-secondary p-1 lg:max-w-xl">
          <TabBtn active={tab === "sent"} onClick={() => setTab("sent")} count={counts.sent}>
            Enviados
          </TabBtn>
          <TabBtn active={tab === "received"} onClick={() => setTab("received")} count={counts.received}>
            Recebidos
          </TabBtn>
          <TabBtn active={tab === "matches"} onClick={() => setTab("matches")} count={counts.matches}>
            Matches
          </TabBtn>
        </div>
      </header>

      <div className="p-4 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-6 lg:p-0 xl:grid-cols-[minmax(0,1fr)_380px] xl:gap-8">
        <div className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {tab === "sent" && <SentList />}
              {tab === "received" && <ReceivedList />}
              {tab === "matches" && <MatchesList />}
            </motion.div>
          </AnimatePresence>
        </div>
        <InterestDetailPanel tab={tab} counts={counts} />
      </div>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex-1 rounded-xl px-3 py-2 text-xs font-semibold transition",
        active ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"
      )}
    >
      {children}
      <span
        className={cn(
          "ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px]",
          active ? "bg-primary/15 text-primary" : "bg-background/60 text-muted-foreground"
        )}
      >
        {count}
      </span>
    </button>
  );
}

function InterestDetailPanel({
  tab,
  counts,
}: {
  tab: Tab;
  counts: { sent: number; received: number; matches: number };
}) {
  const featured =
    tab === "matches" ? propertyById(matches[0]?.propertyId) : propertyById(sentInterests[0]?.propertyId);

  return (
    <aside className="sticky top-6 hidden h-fit space-y-4 lg:block">
      <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <TrendingUp className="h-4 w-4" />
          Pipeline de matchmaking
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Metric label="Enviados" value={counts.sent} />
          <Metric label="Recebidos" value={counts.received} />
          <Metric label="Matches" value={counts.matches} />
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          Matches são um estado dentro de Interesses. Os contatos externos só aparecem quando os dois lados confirmam.
        </p>
      </div>

      {featured && (
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
          <img src={featured.images[0]} alt="" className="h-44 w-full object-cover" />
          <div className="p-4">
            <MatchBadge value={featured.match} variant="soft" />
            <h3 className="mt-3 text-base font-semibold">{featured.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {featured.neighborhood} · {fmtCurrency(featured.price)}
            </p>
            <Button asChild className="mt-4 h-10 w-full rounded-2xl">
              <Link to="/property/$id" params={{ id: featured.id }}>
                Ver detalhes
              </Link>
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-secondary p-3 text-center">
      <div className="text-lg font-bold">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}

function SentList() {
  if (!sentInterests.length) {
    return (
      <EmptyState
        icon={Send}
        title="Nenhum interesse enviado"
        description="Explore imóveis compatíveis e demonstre interesse quando fizer sentido."
      />
    );
  }

  return (
    <div className="space-y-3">
      {sentInterests.map((s, i) => {
        const p = propertyById(s.propertyId);
        if (!p) return null;
        const meta = STATUS_META[s.status];
        const Icon = meta.icon;

        return (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              to="/property/$id"
              params={{ id: p.id }}
              className="block overflow-hidden rounded-3xl bg-card shadow-soft transition active:scale-[0.99]"
            >
              <div className="flex gap-3 p-3">
                <img src={p.images[0]} alt="" className="h-20 w-20 shrink-0 rounded-2xl object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-1 text-sm font-semibold">{p.title}</h3>
                    <span
                      className={cn(
                        "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        meta.tone
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      {meta.label}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {p.neighborhood} · enviado {s.sentAt}
                  </div>
                  <div className="mt-1 text-sm font-bold">{fmtCurrency(p.price)}</div>
                </div>
              </div>

              <div className="border-t border-border bg-secondary/40 px-4 py-3">
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={cn(
                        "h-1 flex-1 rounded-full transition",
                        step <= meta.step ? "bg-primary" : "bg-border"
                      )}
                    />
                  ))}
                </div>
                <div className="mt-1.5 flex justify-between text-[9px] uppercase tracking-wider text-muted-foreground">
                  <span>Interesse</span>
                  <span>Resposta</span>
                  <span>Match</span>
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}

function ReceivedList() {
  if (!receivedInterests.length) {
    return (
      <EmptyState
        icon={Inbox}
        title="Nada recebido ainda"
        description="Quando um vendedor ou corretor indicar um imóvel para seu perfil, ele aparecerá aqui."
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2 rounded-2xl border border-primary/20 bg-primary/5 p-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-xs text-muted-foreground">
          O contato externo só é liberado após interesse mútuo.
        </p>
      </div>

      {receivedInterests.map((r, i) => {
        const p = propertyById(r.propertyId);
        if (!p) return null;

        return (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="overflow-hidden rounded-3xl bg-card shadow-soft"
          >
            <Link to="/property/$id" params={{ id: p.id }} className="block">
              <div className="relative h-32 overflow-hidden">
                <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute left-3 top-3">
                  <MatchBadge value={p.match} />
                </div>
                <div className="absolute bottom-3 left-3 text-white">
                  <div className="text-sm font-semibold">{p.title}</div>
                  <div className="text-[11px] opacity-90">
                    {p.neighborhood} · {fmtCurrency(p.price)}
                  </div>
                </div>
              </div>
            </Link>

            <div className="p-4">
              <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-primary">
                <Sparkles className="h-3 w-3" />
                {r.from === "Sistema" ? "Sugestão inteligente" : "Anunciante interessado"}
              </div>
              <p className="mt-1 text-sm font-medium">{r.reason}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{r.receivedAt}</p>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => toast("Interesse recusado.")}
                  className="flex-1 rounded-2xl border border-border bg-card px-3 py-2.5 text-xs font-semibold text-muted-foreground transition active:scale-95"
                >
                  <X className="mr-1 inline h-3 w-3" />
                  Recusar
                </button>
                <Button
                  onClick={() => toast.success("Interesse aceito. Se houver confirmação mútua, o contato será liberado.")}
                  className="h-auto flex-1 rounded-2xl bg-primary py-2.5 text-xs font-semibold shadow-soft"
                >
                  <Check className="mr-1 h-3 w-3" />
                  Aceitar
                </Button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function MatchesList() {
  if (!matches.length) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Ainda sem matches"
        description="Quando houver interesse mútuo, o contato externo será liberado aqui."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-success/30 bg-success/5 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-success">
          <CheckCircle2 className="h-4 w-4" />
          {matches.length} {matches.length === 1 ? "match" : "matches"} com contato liberado
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Você e o anunciante demonstraram interesse mútuo. Use canais externos para continuar.
        </p>
      </div>

      {matches.map((m, i) => {
        const p = propertyById(m.propertyId);
        if (!p) return null;

        return (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="overflow-hidden rounded-3xl bg-card shadow-card"
          >
            <Link to="/property/$id" params={{ id: p.id }} className="block">
              <div className="relative h-40 overflow-hidden">
                <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                {m.isNew && (
                  <span className="absolute right-3 top-3 rounded-full bg-success px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-success-foreground shadow-float">
                    Novo Match
                  </span>
                )}
                <div className="absolute left-3 top-3">
                  <MatchBadge value={p.match} />
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="text-base font-bold">{p.title}</div>
                  <div className="text-xs opacity-90">
                    {p.neighborhood} · {fmtCurrency(p.price)} · match {m.matchedAt}
                  </div>
                </div>
              </div>
            </Link>

            <div className="space-y-2 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Contato liberado
                  </div>
                  <div className="text-xs text-muted-foreground">Data do match: {m.matchedAt}</div>
                </div>
                <Button
                  size="sm"
                  className="rounded-full"
                  onClick={() => toast.success(`Abrindo WhatsApp de ${p.contact.agent}.`)}
                >
                  Entrar em contato
                </Button>
              </div>
              <ContactRow icon={Send} label="WhatsApp" value={p.contact.whatsapp} accent />
              <ContactRow icon={Phone} label="Telefone" value={p.contact.phone} />
              <ContactRow icon={Mail} label="Email" value={p.contact.email} />
              <p className="pt-1 text-[11px] text-muted-foreground">
                Anunciante: <span className="font-medium text-foreground">{p.contact.agent}</span>
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: any;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left",
        accent ? "border-primary/30 bg-primary/5" : "border-border bg-secondary/40"
      )}
    >
      <div
        className={cn(
          "grid h-9 w-9 place-items-center rounded-full",
          accent ? "bg-primary text-primary-foreground" : "bg-card text-foreground"
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="truncate text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}
