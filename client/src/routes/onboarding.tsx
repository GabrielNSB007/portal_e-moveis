import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { fmtCurrency } from "@/mock/data";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Coins,
  Home,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
});

const OBJECTIVES = [
  { v: "Comprar", desc: "Encontrar meu novo lar", icon: Home },
  { v: "Alugar", desc: "Aluguel inteligente", icon: Building2 },
  { v: "Investir", desc: "Imóveis com bom retorno", icon: Coins },
];
const CITIES = ["São Paulo", "Rio de Janeiro", "Curitiba", "Belo Horizonte", "Porto Alegre", "Florianópolis", "Brasília"];
const TYPES = ["Apartamento", "Casa", "Studio", "Cobertura", "Comercial"];
const LIFESTYLE = ["Pet friendly", "Segurança", "Próximo ao trabalho", "Transporte fácil", "Área de lazer", "Silencioso", "Moderno", "Familiar", "Investimento"];
const AESTHETICS = [
  { v: "Moderno", img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80" },
  { v: "Luxuoso", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" },
  { v: "Minimalista", img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80" },
  { v: "Clássico", img: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=80" },
  { v: "Compacto", img: "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=600&q=80" },
];

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [obj, setObj] = useState<string>("");
  const [cities, setCities] = useState<string[]>([]);
  const [budget, setBudget] = useState([500000, 1500000]);
  const [types, setTypes] = useState<string[]>([]);
  const [beds, setBeds] = useState(2);
  const [baths, setBaths] = useState(2);
  const [life, setLife] = useState<string[]>([]);
  const [aes, setAes] = useState("");

  const TOTAL = 9;
  const tog = (arr: string[], v: string, set: (s: string[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const finish = () => {
    localStorage.setItem("emoveis-onboarded", "1");
    toast.success("Perfil criado com sucesso!");
    setTimeout(() => navigate({ to: "/explore" }), 1800);
  };

  const canNext = (() => {
    switch (step) {
      case 0: return true;
      case 1: return !!obj;
      case 2: return cities.length > 0;
      case 4: return types.length > 0;
      case 6: return life.length > 0;
      case 7: return !!aes;
      default: return true;
    }
  })();

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col bg-gradient-hero">
      <div className="safe-top flex items-center gap-3 px-5 pt-3">
        {step > 0 && step < 8 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="grid h-9 w-9 place-items-center rounded-full bg-card shadow-soft"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <div className="flex-1">
          <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
            <motion.div
              initial={false}
              animate={{ width: `${((step + 1) / TOTAL) * 100}%` }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="h-full bg-gradient-primary"
            />
          </div>
        </div>
        <span className="text-xs font-medium text-muted-foreground">{step + 1}/{TOTAL}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-32 pt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {step === 0 && (
              <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
                <div className="mb-6 grid h-20 w-20 place-items-center rounded-3xl bg-gradient-primary shadow-float">
                  <Sparkles className="h-10 w-10 text-primary-foreground" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight">E-móveis</h1>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-primary">active matchmaking</p>
                <h2 className="mt-8 max-w-md text-3xl font-bold leading-tight">
                  Encontre o imóvel ideal sem perder tempo.
                </h2>
                <p className="mt-4 max-w-md text-base text-muted-foreground">
                  O E-móveis aprende o que você gosta e encontra imóveis compatíveis com você.
                </p>
              </div>
            )}

            {step === 1 && (
              <Step title="Qual é o seu objetivo?" subtitle="Vamos personalizar sua experiência.">
                <div className="grid gap-3">
                  {OBJECTIVES.map(({ v, desc, icon: Icon }) => (
                    <Card key={v} active={obj === v} onClick={() => setObj(v)}>
                      <Icon className="h-6 w-6 text-primary" />
                      <div className="flex-1 text-left">
                        <div className="font-semibold">{v}</div>
                        <div className="text-xs text-muted-foreground">{desc}</div>
                      </div>
                      {obj === v && <Check className="h-5 w-5 text-primary" />}
                    </Card>
                  ))}
                </div>
              </Step>
            )}

            {step === 2 && (
              <Step title="Onde você quer morar?" subtitle="Selecione uma ou mais cidades.">
                <div className="flex flex-wrap gap-2">
                  {CITIES.map((c) => (
                    <Chip key={c} active={cities.includes(c)} onClick={() => tog(cities, c, setCities)}>{c}</Chip>
                  ))}
                </div>
              </Step>
            )}

            {step === 3 && (
              <Step title="Qual o seu orçamento?" subtitle="Você pode ajustar depois.">
                <div className="rounded-3xl bg-card p-6 shadow-soft">
                  <div className="text-center text-2xl font-bold text-primary">
                    {fmtCurrency(budget[0])} – {fmtCurrency(budget[1])}
                  </div>
                  <Slider
                    className="mt-6"
                    value={budget}
                    onValueChange={setBudget}
                    min={100000}
                    max={5000000}
                    step={50000}
                  />
                  <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                    <span>{fmtCurrency(100000)}</span>
                    <span>{fmtCurrency(5000000)}</span>
                  </div>
                </div>
              </Step>
            )}

            {step === 4 && (
              <Step title="Tipo de imóvel" subtitle="O que combina com seu estilo?">
                <div className="flex flex-wrap gap-2">
                  {TYPES.map((t) => (
                    <Chip key={t} active={types.includes(t)} onClick={() => tog(types, t, setTypes)}>{t}</Chip>
                  ))}
                </div>
              </Step>
            )}

            {step === 5 && (
              <Step title="Quartos e banheiros" subtitle="O essencial do seu lar.">
                <Counter label="Quartos" value={beds} setValue={setBeds} />
                <Counter label="Banheiros" value={baths} setValue={setBaths} />
              </Step>
            )}

            {step === 6 && (
              <Step title="Estilo de vida" subtitle="Selecione tudo que faz sentido para você.">
                <div className="flex flex-wrap gap-2">
                  {LIFESTYLE.map((l) => (
                    <Chip key={l} active={life.includes(l)} onClick={() => tog(life, l, setLife)}>{l}</Chip>
                  ))}
                </div>
              </Step>
            )}

            {step === 7 && (
              <Step title="Estética favorita" subtitle="Que vibe combina com você?">
                <div className="grid grid-cols-2 gap-3">
                  {AESTHETICS.map((a) => (
                    <button
                      key={a.v}
                      onClick={() => setAes(a.v)}
                      className={cn(
                        "relative aspect-[4/5] overflow-hidden rounded-2xl text-left transition",
                        aes === a.v ? "ring-4 ring-primary ring-offset-2 ring-offset-background" : ""
                      )}
                    >
                      <img src={a.img} alt={a.v} className="absolute inset-0 h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute bottom-0 p-3 text-white">
                        <div className="font-bold">{a.v}</div>
                      </div>
                      {aes === a.v && (
                        <div className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </Step>
            )}

            {step === 8 && (
              <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.6 }}
                  className="mb-6 grid h-24 w-24 place-items-center rounded-full bg-gradient-primary shadow-float"
                >
                  <Check className="h-12 w-12 text-primary-foreground" strokeWidth={3} />
                </motion.div>
                <h2 className="text-2xl font-bold">Seu perfil foi criado.</h2>
                <p className="mt-2 max-w-xs text-muted-foreground">
                  Estamos buscando imóveis compatíveis com você.
                </p>
                <div className="mt-8 flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="h-2 w-2 rounded-full bg-primary"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-2xl border-t border-border bg-background/90 p-4 backdrop-blur-xl safe-bottom">
        {step < 8 ? (
          <Button
            disabled={!canNext}
            onClick={() => setStep((s) => s + 1)}
            className="h-12 w-full rounded-2xl bg-gradient-primary text-base font-semibold shadow-float"
          >
            {step === 0 ? "Começar" : "Continuar"}
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={finish}
            className="h-12 w-full rounded-2xl bg-gradient-primary text-base font-semibold shadow-float"
          >
            Explorar imóveis
          </Button>
        )}
      </div>
    </div>
  );
}

function Step({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-2xl font-bold leading-tight">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Card({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-2xl border-2 bg-card p-4 text-left transition",
        active ? "border-primary bg-primary/5 shadow-soft" : "border-border hover:border-primary/40"
      )}
    >
      {children}
    </button>
  );
}

function Chip({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-soft"
          : "border-border bg-card text-foreground hover:border-primary/40"
      )}
    >
      {children}
    </button>
  );
}

function Counter({ label, value, setValue }: { label: string; value: number; setValue: (n: number) => void }) {
  return (
    <div className="mb-3 flex items-center justify-between rounded-2xl bg-card p-4 shadow-soft">
      <span className="font-medium">{label}</span>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setValue(Math.max(1, value - 1))}
          className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-lg font-bold"
        >−</button>
        <span className="w-6 text-center font-bold">{value}</span>
        <button
          onClick={() => setValue(value + 1)}
          className="grid h-9 w-9 place-items-center rounded-full bg-primary text-lg font-bold text-primary-foreground"
        >+</button>
      </div>
    </div>
  );
}
