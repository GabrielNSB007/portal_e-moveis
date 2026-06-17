import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  HandCoins,
  Heart,
  Plus,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  agentListings,
  agentMatches,
  agentProfile,
  agentProposals,
  fmtCurrency,
  propertyById,
} from "@/mock/data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/agent")({
  component: AgentDashboard,
});

const totalViews = agentListings.reduce((sum, listing) => sum + listing.views, 0);
const totalInterests = agentListings.reduce((sum, listing) => sum + listing.interests, 0);
const totalMatches = agentListings.reduce((sum, listing) => sum + listing.matches, 0);
const totalVisits = agentListings.reduce((sum, listing) => sum + listing.visits, 0);
const activeListings = agentListings.filter((listing) => listing.status === "ATIVA").length;

const stats = [
  { icon: Eye, label: "Visualizacoes", value: compactNumber(totalViews), trend: "+12%", color: "text-primary", bg: "bg-primary/10" },
  { icon: Heart, label: "Interesses", value: totalInterests, trend: "+8%", color: "text-destructive", bg: "bg-destructive/10" },
  { icon: Sparkles, label: "Matches", value: totalMatches, trend: "+24%", color: "text-success", bg: "bg-success/10" },
  { icon: Users, label: "Visitas", value: totalVisits, trend: "+3", color: "text-warning", bg: "bg-warning/10" },
];

const bars = [40, 65, 55, 80, 70, 92, 88];
const days = ["S", "T", "Q", "Q", "S", "S", "D"];

function AgentDashboard() {
  return (
    <div className="mx-auto min-h-screen pb-24 lg:max-w-[1200px] lg:px-8 lg:py-8 lg:pb-12">
      <header className="safe-top sticky top-0 z-20 flex items-center gap-3 border-b border-border/60 bg-background/95 px-5 py-4 backdrop-blur-xl lg:static lg:mb-8 lg:rounded-[2rem] lg:border lg:border-border/50 lg:bg-card lg:p-8 lg:shadow-sm">
        <Link
          to="/profile"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary text-foreground transition-colors hover:bg-black/10 dark:hover:bg-white/10 lg:h-12 lg:w-12"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1 lg:ml-2">
          <h1 className="truncate text-xl font-bold tracking-tight lg:text-3xl">Area do Anunciante</h1>
          <p className="truncate text-xs font-medium text-muted-foreground lg:mt-1 lg:text-sm">
            {agentProfile.name} · <span className="font-bold text-primary">{agentProfile.company}</span>
          </p>
        </div>
        <Button
          className="hidden h-12 items-center gap-2 rounded-2xl bg-gradient-primary px-6 font-bold shadow-soft transition-transform hover:scale-105 active:scale-95 lg:flex lg:text-base"
          onClick={() => toast.success("Fluxo pronto para integrar ao POST /offers.")}
        >
          <Plus className="h-5 w-5" />
          Cadastrar Imovel
        </Button>
        <Button
          size="icon"
          className="h-10 w-10 shrink-0 rounded-full bg-gradient-primary lg:hidden"
          onClick={() => toast.success("Fluxo pronto para integrar ao POST /offers.")}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </header>

      <div className="space-y-6 p-5 lg:space-y-8 lg:p-0">
        <ActivationCard />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group rounded-[1.5rem] border border-transparent bg-card p-4 shadow-soft transition-colors hover:border-border lg:rounded-[2rem] lg:p-6 lg:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className={`grid h-10 w-10 place-items-center rounded-xl ${stat.bg} lg:h-12 lg:w-12 lg:rounded-2xl`}>
                  <stat.icon className={`h-5 w-5 ${stat.color} lg:h-6 lg:w-6`} />
                </div>
                <span className="inline-flex rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success lg:px-2.5 lg:py-1 lg:text-xs">
                  {stat.trend}
                </span>
              </div>
              <div className="mt-4 text-2xl font-bold lg:mt-5 lg:text-4xl">{stat.value}</div>
              <div className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground lg:text-xs">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-8 xl:grid-cols-[1fr_420px]">
          <WeeklyPerformance />
          <div className="mt-6 space-y-6 lg:mt-0 lg:space-y-8">
            <InsightCard />
            <QuickRegisterCard />
          </div>
        </div>

        <ListingsSection />

        <div className="grid gap-6 lg:grid-cols-2">
          <ProposalsSection />
          <MatchesSection />
        </div>

        <button
          onClick={() => toast.success("Cadastro de imovel preparado para integrar com OfferSchema.")}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-secondary/30 p-5 text-sm font-bold text-muted-foreground transition active:scale-95 lg:hidden"
        >
          <Building2 className="h-5 w-5" />
          Cadastrar novo imovel
        </button>
      </div>
    </div>
  );
}

function ActivationCard() {
  const steps = [
    { label: "Dados", done: agentProfile.verification.personalData },
    { label: "Contato", done: agentProfile.verification.contact },
    { label: "Docs", done: agentProfile.verification.documents },
  ];

  return (
    <div className="rounded-[1.5rem] border border-primary/25 bg-primary/5 p-4 shadow-sm lg:rounded-[2rem] lg:p-6">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-sm font-bold text-primary lg:text-base">
            Cadastro de anunciante
            <BadgeCheck className="h-4 w-4" />
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground lg:text-sm">
            A pessoa entra como comprador e ativa esta area quando quiser anunciar. O backend ja
            tem `UserRole.VENDEDOR`; falta so fechar a conversao do perfil antes do primeiro anuncio.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {steps.map((step) => (
              <div
                key={step.label}
                className={cn(
                  "rounded-2xl px-2 py-2 text-center text-[10px] font-bold lg:text-xs",
                  step.done ? "bg-success/15 text-success" : "bg-card text-muted-foreground",
                )}
              >
                {step.done ? (
                  <CheckCircle2 className="mx-auto mb-1 h-4 w-4" />
                ) : (
                  <Clock className="mx-auto mb-1 h-4 w-4" />
                )}
                {step.label}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Button variant="outline" className="mt-4 h-11 w-full rounded-2xl bg-card font-bold">
        Completar cadastro
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

function WeeklyPerformance() {
  return (
    <div className="rounded-[1.5rem] border border-border/50 bg-card p-5 shadow-sm lg:rounded-[2rem] lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold lg:text-lg">Desempenho semanal</h3>
          <p className="text-xs font-medium text-muted-foreground lg:text-sm">Volume de interesses recebidos</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-xs font-bold text-success lg:text-sm">
          <TrendingUp className="h-4 w-4" />
          +24%
        </span>
      </div>

      <div className="mt-8 flex h-36 items-end gap-2 lg:h-56 lg:gap-4 xl:gap-6">
        {bars.map((height, index) => (
          <div key={`${days[index]}-${index}`} className="group flex flex-1 flex-col items-center gap-2 lg:gap-3">
            <div className="relative w-full flex-1 rounded-t-xl bg-secondary/50 lg:rounded-t-2xl">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: index * 0.06, type: "spring", stiffness: 100 }}
                className="absolute bottom-0 w-full rounded-t-xl bg-gradient-primary transition-opacity group-hover:opacity-80 lg:rounded-t-2xl"
              />
            </div>
            <span className="text-[10px] font-bold uppercase text-muted-foreground lg:text-xs">{days[index]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function InsightCard() {
  return (
    <div className="rounded-[1.5rem] border border-primary/30 bg-primary/5 p-5 shadow-sm lg:rounded-[2rem] lg:p-6">
      <div className="flex items-center gap-2 text-sm font-bold text-primary lg:text-base">
        <Sparkles className="h-5 w-5" />
        Insight do Algoritmo
      </div>
      <p className="mt-3 text-sm leading-relaxed text-foreground/80 lg:text-base">
        Imoveis com <strong className="text-foreground">fotos externas e descricao objetiva</strong> recebem
        mais matches qualificados. Priorize fachada, planta e diferenciais do condominio.
      </p>
    </div>
  );
}

function QuickRegisterCard() {
  return (
    <button
      onClick={() => toast.success("Depois ligamos este fluxo ao POST /offers.")}
      className="hidden w-full flex-col items-center justify-center gap-3 rounded-[2rem] border-2 border-dashed border-border bg-secondary/20 p-8 transition-colors hover:border-primary hover:bg-primary/5 lg:flex"
    >
      <div className="grid h-14 w-14 place-items-center rounded-full bg-card shadow-sm">
        <Building2 className="h-6 w-6 text-primary" />
      </div>
      <div className="text-center">
        <div className="font-bold text-foreground">Cadastrar Novo Imovel</div>
        <div className="mt-1 text-xs text-muted-foreground">Adicione fotos e detalhes para o matchmaking.</div>
      </div>
    </button>
  );
}

function ListingsSection() {
  return (
    <section className="pt-2 lg:pt-6">
      <div className="mb-4 flex items-center justify-between px-1 lg:mb-6 lg:px-2">
        <h3 className="text-base font-bold lg:text-xl">Meus Imoveis</h3>
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-muted-foreground lg:text-sm">
          {activeListings} ativos
        </span>
      </div>

      <div className="grid gap-3 lg:grid-cols-2 lg:gap-5">
        {agentListings.map((listing) => {
          const property = propertyById(listing.propertyId);
          if (!property) return null;

          return (
            <div key={listing.id} className="group flex items-center gap-4 rounded-[1.5rem] border border-border/50 bg-card p-3 shadow-sm transition-all hover:border-border hover:shadow-md lg:p-4">
              <div className="relative shrink-0 overflow-hidden rounded-xl lg:h-24 lg:w-24 lg:rounded-2xl">
                <img src={property.images[0]} alt="" className="h-16 w-16 object-cover transition-transform duration-500 group-hover:scale-110 lg:h-full lg:w-full" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold lg:text-base">{property.title}</div>
                <div className="mt-0.5 text-[11px] font-medium text-muted-foreground lg:mt-1 lg:text-xs">
                  {property.neighborhood} · atualizado {listing.updatedAt}
                </div>
                <div className="mt-1 text-sm font-bold text-foreground lg:mt-2 lg:text-lg">{fmtCurrency(property.price)}</div>
              </div>
              <div className="flex flex-col items-end justify-between self-stretch py-1">
                <StatusPill status={listing.status} />
                <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground lg:text-sm">
                  <Heart className="h-3 w-3 lg:h-4 lg:w-4" />
                  {listing.interests}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function StatusPill({ status }: { status: "ATIVA" | "PAUSADA" | "VENDIDA" }) {
  const active = status === "ATIVA";
  const label = status === "ATIVA" ? "Ativo" : status === "PAUSADA" ? "Pausado" : "Vendido";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider lg:px-3 lg:py-1.5",
        active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground",
      )}
    >
      {active && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
        </span>
      )}
      {label}
    </div>
  );
}

function ProposalsSection() {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between px-1">
        <h3 className="text-base font-bold lg:text-xl">Propostas recentes</h3>
        <span className="text-xs font-bold text-muted-foreground">{agentProposals.length} abertas</span>
      </div>
      <div className="space-y-3">
        {agentProposals.map((proposal) => {
          const property = propertyById(proposal.propertyId);
          return (
            <article key={proposal.id} className="rounded-[1.5rem] border border-border/50 bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-bold lg:text-base">
                    <HandCoins className="h-4 w-4 text-primary" />
                    {fmtCurrency(proposal.value)}
                  </div>
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                    {proposal.buyerName} · {property?.title}
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">
                  {proposal.buyerMatch}%
                </span>
              </div>
              <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{proposal.message}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function MatchesSection() {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between px-1">
        <h3 className="text-base font-bold lg:text-xl">Matches recentes</h3>
        <span className="text-xs font-bold text-muted-foreground">{agentMatches.length} novos</span>
      </div>
      <div className="space-y-3">
        {agentMatches.map((match) => {
          const property = propertyById(match.propertyId);
          return (
            <article key={match.id} className="flex items-center gap-3 rounded-[1.5rem] border border-border/50 bg-card p-4 shadow-sm">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold">{match.buyerName}</div>
                <p className="line-clamp-1 text-xs text-muted-foreground">{match.goal}</p>
                <p className="mt-1 line-clamp-1 text-[10px] font-medium text-muted-foreground">{property?.title}</p>
              </div>
              <span className="rounded-full bg-success/10 px-2.5 py-1 text-[10px] font-bold text-success">
                {match.score}%
              </span>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function compactNumber(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}k`;
  }

  return value.toString();
}
