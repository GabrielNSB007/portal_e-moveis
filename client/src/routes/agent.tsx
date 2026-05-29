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
  { icon: Eye, label: "Visualizações", value: "2.4k", trend: "+12%", color: "text-primary" },
  { icon: Heart, label: "Interesses", value: "184", trend: "+8%", color: "text-destructive" },
  { icon: Sparkles, label: "Matches", value: "62", trend: "+24%", color: "text-success" },
  { icon: Users, label: "Visitas", value: "21", trend: "+3", color: "text-warning" },
];

const bars = [40, 65, 55, 80, 70, 92, 88];
const days = ["S", "T", "Q", "Q", "S", "S", "D"];
const propertyInterestCounts = [18, 34, 27, 42];

function AgentDashboard() {
  return (
    <div className="mx-auto min-h-screen max-w-2xl bg-background pb-10">
      <header className="safe-top sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur-xl">
        <Link to="/explore" className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-bold">Painel do corretor</h1>
          <p className="text-[11px] text-muted-foreground">Marina Costa · Premium</p>
        </div>
        <Button size="sm" className="rounded-full bg-gradient-primary">
          <Plus className="mr-1 h-4 w-4" /> Cadastrar
        </Button>
      </header>

      <div className="space-y-6 p-4">
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-3xl bg-card p-4 shadow-soft"
            >
              <div className="flex items-center justify-between">
                <s.icon className={`h-5 w-5 ${s.color}`} />
                <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
                  {s.trend}
                </span>
              </div>
              <div className="mt-2 text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="rounded-3xl bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Desempenho semanal</h3>
              <p className="text-[11px] text-muted-foreground">Interesses recebidos</p>
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-success">
              <TrendingUp className="h-3.5 w-3.5" /> +24%
            </span>
          </div>
          <div className="mt-5 flex h-32 items-end gap-2">
            {bars.map((h, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: i * 0.06, type: "spring", stiffness: 100 }}
                  className="w-full rounded-t-lg bg-gradient-primary"
                />
                <span className="text-[10px] text-muted-foreground">{days[i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Sparkles className="h-4 w-4" />
            Insight de match
          </div>
          <p className="mt-1.5 text-sm">
            Imóveis com <strong>fotos de fachada externa</strong> recebem 38% mais super matches.
            Adicione fotos externas para destacar seus anúncios.
          </p>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between px-1">
            <h3 className="text-sm font-semibold">Meus imóveis</h3>
            <span className="text-xs text-muted-foreground">{properties.length} ativos</span>
          </div>
          <div className="space-y-3">
            {properties.slice(0, 4).map((p, index) => (
              <div key={p.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-soft">
                <img src={p.images[0]} alt="" className="h-16 w-16 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{p.title}</div>
                  <div className="text-[11px] text-muted-foreground">{p.neighborhood}</div>
                  <div className="text-xs font-bold text-primary">{fmtCurrency(p.price)}</div>
                </div>
                <div className="text-right">
                  <div className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">
                    Ativo
                  </div>
                  <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
                    <Heart className="h-3 w-3" /> {propertyInterestCounts[index]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border p-5 text-sm font-medium text-muted-foreground transition hover:border-primary hover:text-primary">
          <Building2 className="h-5 w-5" />
          Cadastrar novo imóvel
        </button>
      </div>
    </div>
  );
}
