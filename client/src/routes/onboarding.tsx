import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Bath,
  BedDouble,
  Building2,
  Car,
  Check,
  Coins,
  Home,
  MapPin,
  Maximize2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { fmtCurrency } from "@/mock/data";
import { getAuthToken, getSessionEmail, markOnboardingComplete } from "@/lib/auth-session";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import api from "@/services/api";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
});

const OBJECTIVES = [
  { value: "Comprar", desc: "Buscar im?vel para morar", icon: Home },
  { value: "Alugar", desc: "Encontrar aluguel ideal", icon: Building2 },
  { value: "Investir", desc: "Priorizar retorno e liquidez", icon: Coins },
];

const CITY_NEIGHBORHOODS: Record<string, string[]> = {
  "Sao Paulo": ["Pinheiros", "Vila Madalena", "Itaim Bibi", "Moema", "Perdizes", "Vila Olimpia", "Jardins", "Tatuape", "Santana", "Alto de Pinheiros"],
  "Rio de Janeiro": ["Botafogo", "Copacabana", "Ipanema", "Leblon", "Tijuca", "Barra da Tijuca", "Flamengo", "Laranjeiras", "Recreio", "Jardim Botanico"],
  Curitiba: ["Batel", "Agua Verde", "Bigorrilho", "Cabral", "Centro Civico", "Mercês", "Cristo Rei", "Juveve", "Ecoville", "Santa Felicidade"],
  "Belo Horizonte": ["Savassi", "Lourdes", "Funcionarios", "Sion", "Buritis", "Cidade Nova", "Belvedere", "Serra", "Anchieta", "Santa Efigenia"],
  "Porto Alegre": ["Moinhos de Vento", "Bela Vista", "Petropolis", "Menino Deus", "Cidade Baixa", "Auxiliadora", "Rio Branco", "Tristeza", "Higienopolis", "Santana"],
  Florianopolis: ["Centro", "Agronomica", "Trindade", "Itacorubi", "Coqueiros", "Campeche", "Lagoa da Conceicao", "Jurere", "Ingleses", "Canasvieiras"],
  Brasilia: ["Asa Sul", "Asa Norte", "Sudoeste", "Noroeste", "Lago Sul", "Lago Norte", "Aguas Claras", "Guara", "Taguatinga", "Park Sul"],
  Salvador: ["Barra", "Pituba", "Rio Vermelho", "Ondina", "Caminho das Arvores", "Horto Florestal", "Itaigara", "Imbui", "Stella Maris", "Patamares"],
  Recife: ["Boa Viagem", "Pina", "Casa Forte", "Gracas", "Espinheiro", "Aflitos", "Madalena", "Derby", "Parnamirim", "Ilha do Retiro"],
  Fortaleza: ["Meireles", "Aldeota", "Cocó", "Mucuripe", "Varjota", "Dionisio Torres", "Guararapes", "Papicu", "Praia de Iracema", "Cambeba"],
  Goiania: ["Setor Bueno", "Jardim Goias", "Marista", "Oeste", "Sul", "Universitario", "Nova Suica", "Bueno", "Alto da Gloria", "Pedro Ludovico"],
  Vitoria: ["Praia do Canto", "Jardim Camburi", "Jardim da Penha", "Mata da Praia", "Enseada do Sua", "Bento Ferreira", "Santa Lucia", "Barro Vermelho", "Centro", "Ilha do Boi"],
  Natal: ["Ponta Negra", "Tirol", "Petropolis", "Lagoa Nova", "Capim Macio", "Candelaria", "Neopolis", "Areia Preta", "Ribeira", "Barro Vermelho"],
  Maceio: ["Ponta Verde", "Pajucara", "Jatiuca", "Cruz das Almas", "Mangabeiras", "Farol", "Gruta de Lourdes", "Serraria", "Ponta Grossa", "Centro"],
  Manaus: ["Adrianopolis", "Ponta Negra", "Vieiralves", "Nossa Senhora das Gracas", "Aleixo", "Parque 10", "Chapada", "Flores", "Centro", "Dom Pedro"],
};

const CITIES = Object.keys(CITY_NEIGHBORHOODS);
const TYPES = ["Apartamento", "Casa", "Studio", "Cobertura", "Casa em condominio", "Loft", "Garden", "Comercial"];
const AMENITIES = [
  "Pet friendly",
  "Piscina",
  "Academia",
  "Portaria 24h",
  "Varanda",
  "Mobiliado",
  "Churrasqueira",
  "Area de servico",
  "Elevador",
  "Coworking",
  "Playground",
  "Rooftop",
];
const NEARBY = ["Metro", "Parques", "Escolas", "Mercado", "Hospital", "Ciclovia", "Shopping", "Trabalho", "Restaurantes", "Praia", "Academia", "Farmacia"];

const typeToBackend = (type: string) => {
  const normalized = type.toLowerCase();
  if (normalized.includes("casa")) return "CASA";
  if (normalized.includes("studio")) return "STUDIO";
  if (normalized.includes("cobertura")) return "COBERTURA";
  if (normalized.includes("terreno")) return "TERRENO";
  return "APARTAMENTO";
};

const amenityToBackend = (amenity: string) => {
  const normalized = amenity.toLowerCase();
  if (normalized.includes("piscina")) return "PISCINA";
  if (normalized.includes("academia")) return "ACADEMIA";
  if (normalized.includes("churrasqueira")) return "CHURRASQUEIRA";
  if (normalized.includes("elevador")) return "ELEVADOR";
  if (normalized.includes("portaria")) return "PORTARIA";
  if (normalized.includes("mobiliado")) return "MOBILIADO";
  if (normalized.includes("pet")) return "PET_FRIENDLY";
  if (normalized.includes("varanda")) return "VARANDA";
  if (normalized.includes("servico") || normalized.includes("servi?o")) return "AREA_SERVICO";
  return null;
};

const STYLES = [
  { value: "Moderno", img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80" },
  { value: "Compacto", img: "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=600&q=80" },
  { value: "Familiar", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" },
  { value: "Minimalista", img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80" },
];

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [objective, setObjective] = useState("Comprar");
  const [city, setCity] = useState("Sao Paulo");
  const [neighborhoods, setNeighborhoods] = useState<string[]>(["Pinheiros"]);
  const [budget, setBudget] = useState([600000, 1500000]);
  const [types, setTypes] = useState<string[]>(["Apartamento"]);
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(2);
  const [parking, setParking] = useState(1);
  const [area, setArea] = useState([50, 160]);
  const [amenities, setAmenities] = useState<string[]>(["Portaria 24h"]);
  const [nearby, setNearby] = useState<string[]>(["Metro"]);
  const [style, setStyle] = useState("Moderno");

  const budgetBounds = objective === "Alugar" ? { min: 1000, max: 25000, step: 500 } : { min: 100000, max: 5000000, step: 50000 };

  const steps = useMemo(
    () => [
      "Inicio",
      "Objetivo",
      "Localizacao",
      "Orcamento",
      "Imovel",
      "Estrutura",
      "Comodidades",
      "Entorno",
      "Estilo",
      "Resumo",
    ],
    [],
  );

  const toggle = (list: string[], value: string, set: (next: string[]) => void) => {
    set(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  };

  const canNext = (() => {
    if (step === 1) return Boolean(objective);
    if (step === 2) return Boolean(city);
    if (step === 4) return types.length > 0;
    if (step === 8) return Boolean(style);
    return true;
  })();

  const finish = async () => {
    if (!getAuthToken()) {
      navigate({ to: "/auth" });
      return;
    }

    try {
      await api.post("/preferences", {
        title: `Busca para ${objective.toLowerCase()}`,
        minPrice: budget[0],
        maxPrice: budget[1],
        minAreaM2: area[0],
        maxAreaM2: area[1],
        minBedrooms: bedrooms,
        minBathrooms: bathrooms,
        minParkingSpots: parking,
        propertyTypes: Array.from(new Set(types.map(typeToBackend))),
        neighborhoods,
        city,
        state: city === "Brasilia" ? "DF" : "BR",
        desiredAmenities: Array.from(new Set(amenities.map(amenityToBackend).filter(Boolean))),
        isActive: true,
      });
      markOnboardingComplete(getSessionEmail());
      toast.success("Prefer?ncias salvas com sucesso!");
      setTimeout(() => navigate({ to: "/explore" }), 900);
    } catch (error: any) {
      toast.error(error?.response?.data?.error ?? "N?o foi poss?vel salvar suas prefer?ncias.");
    }
  };

  return (
    <div className="grid min-h-dvh bg-background md:place-items-center md:p-6 lg:p-10">
      <div className="flex h-dvh w-full max-w-3xl flex-col overflow-hidden bg-gradient-hero shadow-card md:h-[840px] md:max-h-[90dvh] md:rounded-[2rem] md:border md:border-border">
        <header className="shrink-0 px-5 pt-4 safe-top md:px-8 md:pt-8">
          <div className="flex items-center gap-3">
            {step > 0 ? (
              <button
                onClick={() => setStep((value) => value - 1)}
                className="grid h-10 w-10 place-items-center rounded-2xl bg-card shadow-soft"
                aria-label="Voltar"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            ) : (
              <div className="h-10 w-10" />
            )}
            <div className="min-w-0 flex-1">
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <motion.div
                  initial={false}
                  animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                  className="h-full bg-gradient-primary"
                />
              </div>
            </div>
            <span className="w-12 text-right text-xs font-bold text-muted-foreground">
              {step + 1}/{steps.length}
            </span>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto px-5 py-6 md:px-8 md:py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="min-h-full"
            >
              {step === 0 && (
                <Intro />
              )}

              {step === 1 && (
                <Step title="Qual ? o seu momento?" subtitle="Isso muda pre?o, filtros e prioridade dos resultados.">
                  <div className="grid gap-3">
                    {OBJECTIVES.map(({ value, desc, icon: Icon }) => (
                      <ChoiceCard key={value} active={objective === value} onClick={() => {
                        setObjective(value);
                        if (value === "Alugar") setBudget([3000, 9000]);
                        if (value !== "Alugar") setBudget([600000, 1500000]);
                      }}>
                        <Icon className="h-5 w-5 text-primary" />
                        <div className="min-w-0 flex-1">
                          <div className="font-bold">{value}</div>
                          <div className="text-xs text-muted-foreground">{desc}</div>
                        </div>
                      </ChoiceCard>
                    ))}
                  </div>
                </Step>
              )}

              {step === 2 && (
                <Step title="Onde voce procura?" subtitle="Escolha uma capital. Os bairros mudam conforme a cidade.">
                  <SectionLabel icon={MapPin} title="Cidade" />
                  <ChipGroup
                    items={CITIES}
                    selected={[city]}
                    onToggle={(value) => {
                      setCity(value);
                      setNeighborhoods([]);
                    }}
                    columns="md:grid-cols-5"
                    single
                  />
                  <SectionLabel icon={MapPin} title={`Principais bairros em ${city}`} className="mt-7" />
                  <ChipGroup
                    items={CITY_NEIGHBORHOODS[city] ?? []}
                    selected={neighborhoods}
                    onToggle={(value) => toggle(neighborhoods, value, setNeighborhoods)}
                    columns="md:grid-cols-5"
                  />
                </Step>
              )}

              {step === 3 && (
                <Step title={objective === "Alugar" ? "Qual aluguel cabe no mes?" : "Qual faixa de pre?o faz sentido?"} subtitle="Esse filtro tamb?m aparece na tela Explorar.">
                  <RangeCard
                    value={budget}
                    onChange={setBudget}
                    min={budgetBounds.min}
                    max={budgetBounds.max}
                    step={budgetBounds.step}
                    format={fmtCurrency}
                  />
                </Step>
              )}

              {step === 4 && (
                <Step title="Que tipo de im?vel voce aceita?" subtitle="Selecione todos que fariam sentido.">
                  <ChipGroup items={TYPES} selected={types} onToggle={(value) => toggle(types, value, setTypes)} columns="md:grid-cols-4" />
                </Step>
              )}

              {step === 5 && (
                <Step title="Estrutura minima" subtitle="Quartos, banheiros, vaga e area filtram bastante o feed.">
                  <Counter icon={BedDouble} label="Quartos" value={bedrooms} setValue={setBedrooms} />
                  <Counter icon={Bath} label="Banheiros" value={bathrooms} setValue={setBathrooms} />
                  <Counter icon={Car} label="Vagas" value={parking} setValue={setParking} min={0} />
                  <SectionLabel icon={Maximize2} title="Area util" className="mt-6" />
                  <RangeCard value={area} onChange={setArea} min={20} max={400} step={10} suffix="m2" />
                </Step>
              )}

              {step === 6 && (
                <Step title="O que precisa ter?" subtitle="Esses itens viram comodidades desejadas.">
                  <ChipGroup items={AMENITIES} selected={amenities} onToggle={(value) => toggle(amenities, value, setAmenities)} columns="md:grid-cols-4" />
                </Step>
              )}

              {step === 7 && (
                <Step title="O que precisa estar perto?" subtitle="Ajuda o match a priorizar localiza??o al?m do bairro.">
                  <ChipGroup items={NEARBY} selected={nearby} onToggle={(value) => toggle(nearby, value, setNearby)} columns="md:grid-cols-4" />
                </Step>
              )}

              {step === 8 && (
                <Step title="Qual visual combina mais?" subtitle="N?o elimina resultados; so ajuda a ordenar.">
                  <div className="mx-auto grid max-w-2xl grid-cols-2 gap-3 md:gap-4">
                    {STYLES.map((item) => (
                      <button
                        key={item.value}
                        onClick={() => setStyle(item.value)}
                        className={cn(
                          "group overflow-hidden rounded-2xl border bg-card text-left transition",
                          style === item.value ? "border-primary ring-2 ring-primary/30" : "border-border",
                        )}
                      >
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <img src={item.img} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                          {style === item.value && (
                            <span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground">
                              <Check className="h-4 w-4" />
                            </span>
                          )}
                        </div>
                        <div className="px-3 py-2 text-center text-sm font-bold">{item.value}</div>
                      </button>
                    ))}
                  </div>
                </Step>
              )}

              {step === 9 && (
                <Step title="Perfil pronto para buscar" subtitle="Voce pode editar tudo depois nos filtros e no perfil.">
                  <div className="space-y-3">
                    <SummaryRow label="Objetivo" value={objective} />
                    <SummaryRow label="Regiao" value={[city, ...neighborhoods].join(", ")} />
                    <SummaryRow label="Preco" value={`${fmtCurrency(budget[0])} ate ${fmtCurrency(budget[1])}`} />
                    <SummaryRow label="Tipos" value={types.join(", ")} />
                    <SummaryRow label="Estrutura" value={`${bedrooms}+ quartos, ${bathrooms}+ banheiros, ${parking}+ vagas`} />
                    <SummaryRow label="Comodidades" value={amenities.length ? amenities.join(", ") : "Sem prefer?ncia"} />
                  </div>
                </Step>
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="shrink-0 border-t border-border bg-background/95 p-4 backdrop-blur-xl safe-bottom md:px-8 md:py-5">
          <Button
            disabled={!canNext}
            onClick={() => (step === steps.length - 1 ? finish() : setStep((value) => value + 1))}
            className="h-12 w-full rounded-2xl bg-gradient-primary text-base font-bold shadow-soft md:h-14"
          >
            {step === steps.length - 1 ? "Explorar im?veis" : step === 0 ? "Come?ar" : "Continuar"}
            <ArrowRight className="h-5 w-5" />
          </Button>
        </footer>
      </div>
    </div>
  );
}

function Intro() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center py-8 text-center">
      <div className="mb-6 grid h-20 w-20 place-items-center rounded-3xl bg-gradient-primary shadow-float">
        <Sparkles className="h-10 w-10 text-primary-foreground" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight md:text-5xl">E-moveis</h1>
      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-primary">active matchmaking</p>
      <h2 className="mt-8 max-w-md text-3xl font-bold leading-tight md:text-4xl">
        Vamos montar seu filtro inicial.
      </h2>
      <p className="mt-4 max-w-md text-base text-muted-foreground md:text-lg">
        As respostas alimentam a busca e podem ser refinadas depois na tela Explorar.
      </p>
      <Link to="/auth" className="mt-6 text-sm font-semibold text-primary hover:underline">
        Entrar com outra conta
      </Link>
    </div>
  );
}

function Step({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-2xl font-bold leading-tight md:text-3xl">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function ChoiceCard({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl border bg-card p-4 text-left transition",
        active ? "border-primary bg-primary/5 shadow-soft" : "border-border hover:border-primary/40",
      )}
    >
      {children}
      {active && <Check className="h-5 w-5 text-primary" />}
    </button>
  );
}

function ChipGroup({
  items,
  selected,
  onToggle,
  columns = "md:grid-cols-3",
  single,
}: {
  items: string[];
  selected: string[];
  onToggle: (value: string) => void;
  columns?: string;
  single?: boolean;
}) {
  return (
    <div className={cn("grid grid-cols-2 gap-2", columns)}>
      {items.map((item) => {
        const active = selected.includes(item);
        return (
          <button
            key={item}
            onClick={() => onToggle(item)}
            className={cn(
              "min-h-11 rounded-2xl border px-3 py-2 text-center text-sm font-semibold transition active:scale-95",
              active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/40",
              single && active && "shadow-soft",
            )}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}

function SectionLabel({ icon: Icon, title, className }: { icon: any; title: string; className?: string }) {
  return (
    <div className={cn("mb-3 flex items-center gap-2 text-sm font-bold", className)}>
      <Icon className="h-4 w-4 text-primary" />
      {title}
    </div>
  );
}

function RangeCard({
  value,
  onChange,
  min,
  max,
  step,
  format,
  suffix,
}: {
  value: number[];
  onChange: (value: number[]) => void;
  min: number;
  max: number;
  step: number;
  format?: (value: number) => string;
  suffix?: string;
}) {
  const display = (number: number) => (format ? format(number) : `${number}${suffix ? ` ${suffix}` : ""}`);

  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-soft md:p-6">
      <Slider value={value} onValueChange={onChange} min={min} max={max} step={step} />
      <div className="mt-4 flex justify-between text-xs font-semibold text-muted-foreground">
        <span>{display(value[0])}</span>
        <span>{display(value[1])}</span>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <NumberInput label="Minimo" value={value[0]} onChange={(next) => onChange([Math.min(next, value[1]), value[1]])} format={format} suffix={suffix} />
        <NumberInput label="Maximo" value={value[1]} onChange={(next) => onChange([value[0], Math.max(next, value[0])])} format={format} suffix={suffix} />
      </div>
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  format,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
  suffix?: string;
}) {
  const displayValue = format
    ? format(value)
    : `${value.toLocaleString("pt-BR")}${suffix ? ` ${suffix}` : ""}`;
  const parseNumber = (raw: string) => Number(raw.replace(/\D/g, "")) || 0;

  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="flex h-11 items-center rounded-2xl border border-border bg-background px-3 focus-within:border-primary">
        <input
          value={displayValue}
          onFocus={(event) => event.target.select()}
          onChange={(event) => onChange(parseNumber(event.target.value))}
          className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none"
          inputMode="numeric"
        />
      </div>
    </label>
  );
}

function Counter({
  icon: Icon,
  label,
  value,
  setValue,
  min = 1,
}: {
  icon: any;
  label: string;
  value: number;
  setValue: (value: number) => void;
  min?: number;
}) {
  return (
    <div className="mb-3 flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <span className="font-bold">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => setValue(Math.max(min, value - 1))} className="grid h-9 w-9 place-items-center rounded-full bg-secondary font-bold">
          -
        </button>
        <input
          value={value}
          onChange={(event) => setValue(Math.max(min, Number(event.target.value) || min))}
          className="w-10 bg-transparent text-center font-bold outline-none"
          type="number"
        />
        <button onClick={() => setValue(value + 1)} className="grid h-9 w-9 place-items-center rounded-full bg-primary font-bold text-primary-foreground">
          +
        </button>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-bold">{value}</div>
    </div>
  );
}
