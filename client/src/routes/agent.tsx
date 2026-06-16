import { createFileRoute, Link } from "@tanstack/react-router";
import { properties, fmtCurrency } from "@/mock/data";
import {
  ArrowLeft,
  Building2,
  Eye,
  Heart,
  Plus,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export const Route = createFileRoute("/agent")({
  component: AgentDashboard,
});

const stats = [
  { icon: Eye, label: "Visualizações", value: "2.4k", trend: "+12%", color: "text-primary", bg: "bg-primary/10" },
  { icon: Heart, label: "Interesses", value: "184", trend: "+8%", color: "text-destructive", bg: "bg-destructive/10" },
  { icon: Sparkles, label: "Matches", value: "62", trend: "+24%", color: "text-success", bg: "bg-success/10" },
  { icon: Users, label: "Visitas", value: "21", trend: "+3", color: "text-warning", bg: "bg-warning/10" },
];

const bars = [40, 65, 55, 80, 70, 92, 88];
const days = ["S", "T", "Q", "Q", "S", "S", "D"];
const propertyInterestCounts = [18, 34, 27, 42];

function AgentDashboard() {
  return (
    <div className="mx-auto min-h-screen pb-24 lg:max-w-[1200px] lg:px-8 lg:py-8 lg:pb-12">
      
      {/* HEADER DESKTOP / MOBILE */}
      <header className="safe-top sticky top-0 z-20 flex items-center gap-3 border-b border-border/60 bg-background/95 px-5 py-4 backdrop-blur-xl lg:static lg:mb-8 lg:rounded-[2rem] lg:border lg:border-border/50 lg:bg-card lg:p-8 lg:shadow-sm">
        <Link 
          to="/explore" 
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary text-foreground transition-colors hover:bg-black/10 dark:hover:bg-white/10 lg:h-12 lg:w-12"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1 lg:ml-2">
          <h1 className="truncate text-xl font-bold tracking-tight lg:text-3xl">Painel do Anunciante</h1>
          <p className="truncate text-xs font-medium text-muted-foreground lg:mt-1 lg:text-sm">
            Marina Costa · <span className="font-bold text-primary">Conta Premium</span>
          </p>
        </div>
        <Button className="hidden h-12 items-center gap-2 rounded-2xl bg-gradient-primary px-6 font-bold shadow-soft transition-transform hover:scale-105 active:scale-95 lg:flex lg:text-base">
          <Plus className="h-5 w-5" /> Cadastrar Imóvel
        </Button>
        {/* Botão Mobile */}
        <Button size="icon" className="h-10 w-10 shrink-0 rounded-full bg-gradient-primary lg:hidden">
          <Plus className="h-5 w-5" />
        </Button>
      </header>

      <div className="space-y-6 p-5 lg:space-y-8 lg:p-0">
        
        {/* ESTATÍSTICAS (Grid responsivo: 2 colunas mobile, 4 desktop) */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group rounded-[1.5rem] border border-transparent bg-card p-4 shadow-soft transition-colors hover:border-border lg:rounded-[2rem] lg:p-6 lg:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className={`grid h-10 w-10 place-items-center rounded-xl ${s.bg} lg:h-12 lg:w-12 lg:rounded-2xl`}>
                  <s.icon className={`h-5 w-5 ${s.color} lg:h-6 lg:w-6`} />
                </div>
                <span className="inline-flex rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success lg:px-2.5 lg:py-1 lg:text-xs">
                  {s.trend}
                </span>
              </div>
              <div className="mt-4 text-2xl font-bold lg:mt-5 lg:text-4xl">{s.value}</div>
              <div className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground lg:text-xs">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* ÁREA CENTRAL: GRÁFICO E INSIGHTS */}
        <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-8 xl:grid-cols-[1fr_420px]">
          
          {/* Gráfico de Desempenho */}
          <div className="rounded-[1.5rem] border border-border/50 bg-card p-5 shadow-sm lg:rounded-[2rem] lg:p-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold lg:text-lg">Desempenho semanal</h3>
                <p className="text-xs font-medium text-muted-foreground lg:text-sm">Volume de interesses recebidos</p>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-xs font-bold text-success lg:text-sm">
                <TrendingUp className="h-4 w-4" /> +24%
              </span>
            </div>
            
            <div className="mt-8 flex h-36 items-end gap-2 lg:h-56 lg:gap-4 xl:gap-6">
              {bars.map((h, i) => (
                <div key={i} className="group flex flex-1 flex-col items-center gap-2 lg:gap-3">
                  <div className="relative w-full flex-1 rounded-t-xl bg-secondary/50 lg:rounded-t-2xl">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: i * 0.06, type: "spring", stiffness: 100 }}
                      className="absolute bottom-0 w-full rounded-t-xl bg-gradient-primary transition-opacity group-hover:opacity-80 lg:rounded-t-2xl"
                    />
                  </div>
                  <span className="text-[10px] font-bold uppercase text-muted-foreground lg:text-xs">{days[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Coluna da Direita (Desktop) / Abaixo (Mobile) */}
          <div className="mt-6 space-y-6 lg:mt-0 lg:space-y-8">
            {/* Insight Card */}
            <div className="rounded-[1.5rem] border border-primary/30 bg-primary/5 p-5 shadow-sm lg:rounded-[2rem] lg:p-6">
              <div className="flex items-center gap-2 text-sm font-bold text-primary lg:text-base">
                <Sparkles className="h-5 w-5" />
                Insight do Algoritmo
              </div>
              <p className="mt-3 text-sm leading-relaxed text-foreground/80 lg:text-base">
                Imóveis com <strong className="text-foreground">fotos de fachada externa</strong> bem iluminadas recebem 38% mais super matches. 
                Tente atualizar as fotos do seu último anúncio para aumentar a conversão.
              </p>
            </div>

            {/* Dropzone / CTA Gigante (Oculto no mobile, já tem no header) */}
            <button className="hidden w-full flex-col items-center justify-center gap-3 rounded-[2rem] border-2 border-dashed border-border bg-secondary/20 p-8 transition-colors hover:border-primary hover:bg-primary/5 lg:flex">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-card shadow-sm">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div className="text-center">
                <div className="font-bold text-foreground">Cadastrar Novo Imóvel</div>
                <div className="mt-1 text-xs text-muted-foreground">Adicione fotos e detalhes para o matchmaking.</div>
              </div>
            </button>
          </div>
        </div>

        {/* MEUS IMÓVEIS */}
        <div className="pt-2 lg:pt-6">
          <div className="mb-4 flex items-center justify-between px-1 lg:mb-6 lg:px-2">
            <h3 className="text-base font-bold lg:text-xl">Meus Imóveis Ativos</h3>
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-muted-foreground lg:text-sm">
              {properties.length} cadastrados
            </span>
          </div>
          
          {/* Grid de imóveis (1 coluna mobile, 2 colunas desktop) */}
          <div className="grid gap-3 lg:grid-cols-2 lg:gap-5">
            {properties.slice(0, 4).map((p, index) => (
              <div key={p.id} className="group flex items-center gap-4 rounded-[1.5rem] border border-border/50 bg-card p-3 shadow-sm transition-all hover:border-border hover:shadow-md lg:p-4">
                <div className="relative shrink-0 overflow-hidden rounded-xl lg:h-24 lg:w-24 lg:rounded-2xl">
                  <img src={p.images[0]} alt="" className="h-16 w-16 object-cover transition-transform duration-500 group-hover:scale-110 lg:h-full lg:w-full" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold lg:text-base">{p.title}</div>
                  <div className="mt-0.5 text-[11px] font-medium text-muted-foreground lg:mt-1 lg:text-xs">{p.neighborhood}</div>
                  <div className="mt-1 text-sm font-bold text-foreground lg:mt-2 lg:text-lg">{fmtCurrency(p.price)}</div>
                </div>
                <div className="flex flex-col items-end justify-between self-stretch py-1">
                  <div className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-success lg:px-3 lg:py-1.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success"></span>
                    </span>
                    Ativo
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground lg:text-sm">
                    <Heart className="h-3 w-3 lg:h-4 lg:w-4" /> {propertyInterestCounts[index]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botão Mobile Inferior (Oculto no Desktop) */}
        <button className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-secondary/30 p-5 text-sm font-bold text-muted-foreground transition active:scale-95 lg:hidden">
          <Building2 className="h-5 w-5" />
          Cadastrar novo imóvel
        </button>

      </div>
    </div>
  );
}