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
  Building2,
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
    <div className="mx-auto pb-24 lg:max-w-[1200px] lg:px-8 lg:py-8 lg:pb-12">
      
      {/* HEADER / HERO SECTION */}
      <header className="safe-top sticky top-0 z-30 border-b border-border/60 bg-background/95 px-5 pb-4 pt-4 backdrop-blur-xl lg:static lg:mb-8 lg:rounded-[2rem] lg:border lg:border-border/50 lg:bg-card lg:p-8 lg:shadow-sm">
        <div className="lg:flex lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">Interesses</h1>
            <p className="mt-1 text-xs text-muted-foreground lg:mt-2 lg:text-base">
              Matchmaking imobiliário sem contato invasivo.
            </p>
          </div>

          <div className="mt-5 flex gap-1.5 rounded-2xl bg-secondary/70 p-1.5 lg:mt-0 lg:w-[450px]">
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
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL (Grid no Desktop) */}
      <div className="mt-2 p-5 lg:mt-0 lg:grid lg:grid-cols-[1fr_360px] lg:gap-8 lg:p-0 xl:grid-cols-[1fr_400px] xl:gap-12">
        <div className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {tab === "sent" && <SentList />}
              {tab === "received" && <ReceivedList />}
              {tab === "matches" && <MatchesList />}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* SIDEBAR DESKTOP */}
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
        "relative flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-bold transition-all lg:text-sm",
        active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5"
      )}
    >
      {children}
      <span
        className={cn(
          "inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1.5 text-[10px] lg:h-5 lg:min-w-5 lg:text-xs",
          active ? "bg-primary/15 text-primary" : "bg-background/80 text-muted-foreground"
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
    <aside className="sticky top-8 hidden h-fit space-y-6 lg:block">
      <div className="rounded-[2rem] border border-border bg-card p-6 shadow-xl">
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary">
          <TrendingUp className="h-4 w-4" />
          Pipeline do Matchmaking
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          <Metric label="Enviados" value={counts.sent} />
          <Metric label="Recebidos" value={counts.received} />
          <Metric label="Matches" value={counts.matches} />
        </div>
        <div className="mt-5 rounded-2xl bg-secondary/50 p-4 text-xs leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Dica:</strong> Matches são a evolução de um interesse mútuo. Os dados de contato dos proprietários ou corretores só aparecem quando os dois lados confirmam na plataforma.
        </div>
      </div>

      {featured && (
        <div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-lg transition-transform hover:-translate-y-1">
          <div className="relative h-56 w-full">
            <img src={featured.images[0]} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute left-4 top-4">
              <MatchBadge value={featured.match} />
            </div>
          </div>
          <div className="p-6">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Destaque do Pipeline</div>
            <h3 className="mt-1 line-clamp-1 text-lg font-bold text-foreground">{featured.title}</h3>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              {featured.neighborhood} · {fmtCurrency(featured.price)}
            </p>
            <Button asChild className="mt-6 h-12 w-full rounded-2xl font-bold">
              <Link to="/property/$id" params={{ id: featured.id }}>
                Ver página do imóvel
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
    <div className="rounded-2xl border border-transparent bg-secondary p-4 text-center transition-colors hover:border-border">
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function SentList() {
  if (!sentInterests.length) {
    return (
      <div className="mt-8 lg:mt-16">
        <EmptyState
          icon={Send}
          title="Nenhum interesse enviado"
          description="Explore os imóveis compatíveis com seu perfil e demonstre interesse quando encontrar o lar ideal."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-5">
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
              className="group block overflow-hidden rounded-[1.5rem] border border-border/50 bg-card shadow-sm transition-all hover:border-border hover:shadow-md active:scale-[0.99] lg:rounded-[2rem]"
            >
              <div className="flex gap-4 p-4 lg:p-5">
                <div className="relative shrink-0 overflow-hidden rounded-2xl lg:h-28 lg:w-28 lg:rounded-[1.25rem]">
                  <img src={p.images[0]} alt="" className="h-20 w-20 object-cover transition-transform duration-500 group-hover:scale-110 lg:h-full lg:w-full" />
                </div>
                <div className="min-w-0 flex-1 pt-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="line-clamp-1 text-base font-bold lg:text-lg">{p.title}</h3>
                    <span
                      className={cn(
                        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider lg:px-3 lg:py-1.5 lg:text-xs",
                        meta.tone
                      )}
                    >
                      <Icon className="h-3 w-3 lg:h-3.5 lg:w-3.5" />
                      <span className="hidden sm:inline">{meta.label}</span>
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground lg:text-sm">
                    {p.neighborhood} · enviado {s.sentAt}
                  </div>
                  <div className="mt-2 text-lg font-bold text-foreground lg:mt-3 lg:text-xl">{fmtCurrency(p.price)}</div>
                </div>
              </div>

              {/* BARRA DE PROGRESSO DO PIPELINE */}
              <div className="border-t border-border bg-secondary/30 px-5 py-4 lg:px-6">
                <div className="flex items-center gap-2">
                  {[0, 1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className="relative flex-1"
                    >
                      <div
                        className={cn(
                          "h-1.5 w-full rounded-full transition-all duration-500 lg:h-2",
                          step <= meta.step ? "bg-primary" : "bg-border/60"
                        )}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground lg:text-xs">
                  <span>Enviado</span>
                  <span className="hidden sm:inline">Visualizado</span>
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
      <div className="mt-8 lg:mt-16">
        <EmptyState
          icon={Inbox}
          title="Nada recebido ainda"
          description="Quando um vendedor ou corretor indicar um imóvel compatível para o seu perfil, ele aparecerá aqui."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 lg:rounded-[1.5rem] lg:p-5">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <p className="text-sm font-medium text-primary/80 lg:text-base">
          Seus dados estão protegidos. O contato externo só será liberado após você aceitar e dar o <strong className="text-primary">Match mútuo</strong>.
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
            className="overflow-hidden rounded-[1.5rem] border border-border/50 bg-card shadow-sm transition-shadow hover:shadow-md lg:rounded-[2rem]"
          >
            <Link to="/property/$id" params={{ id: p.id }} className="group block">
              <div className="relative h-40 overflow-hidden lg:h-48">
                <img src={p.images[0]} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute left-4 top-4">
                  <MatchBadge value={p.match} />
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="line-clamp-1 text-lg font-bold lg:text-xl">{p.title}</div>
                  <div className="mt-1 text-xs font-medium opacity-90 lg:text-sm">
                    {p.neighborhood} · {fmtCurrency(p.price)}
                  </div>
                </div>
              </div>
            </Link>

            <div className="p-5 lg:p-6">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-primary lg:text-xs">
                <Sparkles className="h-4 w-4" />
                {r.from === "Sistema" ? "Sugestão do Algoritmo" : "Anunciante interessado em você"}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-foreground lg:text-base">{r.reason}</p>
              <p className="mt-2 text-[11px] font-medium text-muted-foreground lg:text-xs">Recebido: {r.receivedAt}</p>

              <div className="mt-5 flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => toast("Interesse recusado e arquivado.")}
                  className="h-12 flex-1 rounded-xl text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive lg:rounded-2xl"
                >
                  <X className="mr-2 h-4 w-4" />
                  Recusar
                </Button>
                <Button
                  onClick={() => toast.success("Interesse aceito! Se houver confirmação mútua, o contato será liberado.")}
                  className="h-12 flex-1 rounded-xl bg-primary font-bold shadow-soft transition-transform active:scale-95 lg:rounded-2xl"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Aceitar Imóvel
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
      <div className="mt-8 lg:mt-16">
        <EmptyState
          icon={Sparkles}
          title="Ainda sem matches"
          description="Quando houver interesse mútuo entre você e o anunciante, os dados de contato externos serão liberados aqui."
        />
      </div>
    );
  }

  return (
    <div className="space-y-5 lg:space-y-6">
      <div className="rounded-[1.5rem] border border-success/30 bg-success/5 p-5 lg:rounded-[2rem] lg:p-6">
        <div className="flex items-center gap-2 text-base font-bold text-success lg:text-lg">
          <CheckCircle2 className="h-5 w-5" />
          {matches.length} {matches.length === 1 ? "Match com contato liberado" : "Matches com contato liberado"}
        </div>
        <p className="mt-2 text-sm leading-relaxed text-success/80 lg:text-base">
          Você e os anunciantes demonstraram interesse mútuo. Use os canais abaixo para agendar visitas ou negociar.
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
            className="overflow-hidden rounded-[1.5rem] border border-border/50 bg-card shadow-card lg:rounded-[2rem]"
          >
            <Link to="/property/$id" params={{ id: p.id }} className="group block">
              <div className="relative h-48 overflow-hidden lg:h-56">
                <img src={p.images[0]} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                {m.isNew && (
                  <span className="absolute right-4 top-4 rounded-full bg-success px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-success-foreground shadow-float">
                    Novo Match
                  </span>
                )}
                <div className="absolute left-4 top-4">
                  <MatchBadge value={p.match} />
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="line-clamp-1 text-xl font-bold lg:text-2xl">{p.title}</div>
                  <div className="mt-1 text-sm font-medium opacity-90 lg:text-base">
                    {p.neighborhood} · {fmtCurrency(p.price)}
                  </div>
                </div>
              </div>
            </Link>

            <div className="p-5 lg:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-success lg:text-xs">
                    <Building2 className="h-3 w-3 lg:h-4 lg:w-4" /> Contato Liberado
                  </div>
                  <div className="mt-1 text-xs font-medium text-muted-foreground lg:text-sm">Data do match: {m.matchedAt}</div>
                </div>
                <Button
                  className="h-10 rounded-xl font-bold lg:h-12 lg:rounded-2xl lg:text-base"
                  onClick={() => toast.success(`Abrindo WhatsApp de ${p.contact.agent}.`)}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Chamar no WhatsApp
                </Button>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:mt-6 lg:grid-cols-3">
                <ContactRow icon={Send} label="WhatsApp" value={p.contact.whatsapp} accent />
                <ContactRow icon={Phone} label="Telefone" value={p.contact.phone} />
                <ContactRow icon={Mail} label="Email" value={p.contact.email} />
              </div>
              
              <div className="mt-4 rounded-xl bg-secondary/40 px-4 py-3 text-xs font-medium text-muted-foreground lg:mt-5 lg:text-sm">
                Anunciante: <strong className="text-foreground">{p.contact.agent}</strong>
              </div>
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
        "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors hover:bg-black/5 dark:hover:bg-white/5",
        accent ? "border-primary/30 bg-primary/5" : "border-border/60 bg-card"
      )}
    >
      <div
        className={cn(
          "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
          accent ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary text-foreground"
        )}
      >
        <Icon className="h-4 w-4 lg:h-5 lg:w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground lg:text-xs">{label}</div>
        <div className="truncate text-sm font-bold text-foreground lg:text-base">{value}</div>
      </div>
    </div>
  );
}