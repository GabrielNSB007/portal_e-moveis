import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Bell, BedDouble, Home, MapPin, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { properties, fmtCurrency } from "@/mock/data";
import { EmptyState } from "@/components/emoveis/EmptyState";
import { FilterModal } from "@/components/emoveis/FilterModal";
import { Logo } from "@/components/emoveis/Logo";
import { PropertyCard } from "@/components/emoveis/PropertyCard";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_tabs/explore")({
  component: Explore,
});

const QUICK_FILTERS = ["Para você", "Perto de mim", "Pet friendly", "Até R$ 1M", "2 quartos", "Cobertura"];
const NBHD = ["Vila Madalena", "Pinheiros", "Itaim Bibi", "Perdizes", "Vila Olímpia", "Alto de Pinheiros"];
const TYPES = ["Apartamento", "Casa", "Studio", "Cobertura"];

function Explore() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeChip, setActiveChip] = useState("Para você");
  
  // ESTADOS DOS FILTROS
  const [budget, setBudget] = useState([0, 50000000]);
  const [selectedNbhd, setSelectedNbhd] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  // LÓGICA DE FILTRAGEM COMPLETA
  const filtered = useMemo(() => {
    return properties.filter((property) => {
      // 1. Filtro de Busca por Texto
      const normalizedQuery = query.trim().toLowerCase();
      const matchesQuery = normalizedQuery === "" || [property.title, property.neighborhood, property.city, property.type]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery));

      // 2. Filtro de Orçamento
      const matchesBudget = property.price >= budget[0] && property.price <= budget[1];

      // 3. Filtro de Região (Se vazio, passa tudo)
      const matchesNbhd = selectedNbhd.length === 0 || selectedNbhd.includes(property.neighborhood);

      // 4. Filtro de Tipo (Se vazio, passa tudo)
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(property.type);

      // Retorna true APENAS se o imóvel passar em TODOS os testes
      return matchesQuery && matchesBudget && matchesNbhd && matchesType;
    });
  }, [query, budget, selectedNbhd, selectedTypes]); // Atualiza sempre que qualquer estado mudar

  // Separar o destaque do resto da lista
  const top = filtered.length > 0 ? filtered[0] : null;
  const rest = filtered.length > 1 ? filtered.slice(1) : [];

  return (
    <div className="pb-2 lg:px-8 lg:py-6">
      <header className="safe-top sticky top-0 z-30 border-b border-border/60 bg-background/95 px-4 pb-3 backdrop-blur-xl lg:static lg:border-0 lg:bg-transparent lg:px-0 lg:pb-6 lg:pt-0">
        <div className="flex items-center justify-between lg:hidden">
          <Logo />
          <Link to="/alertas" className="relative grid h-10 w-10 place-items-center rounded-full bg-secondary">
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
          </Link>
        </div>

        <div className="hidden items-end justify-between gap-6 lg:flex">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Explorar</div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Imóveis compatíveis para Ana</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Feed inteligente com imóveis, vendedores e corretores alinhados ao perfil.
            </p>
          </div>
          <Link to="/alertas" className="relative grid h-11 w-11 place-items-center rounded-2xl bg-card shadow-soft">
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-primary" />
          </Link>
        </div>

        <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground lg:hidden">
          <MapPin className="h-3 w-3" /> São Paulo · região central
        </div>

        <div className="mt-3 flex gap-2 lg:mt-0 lg:hidden">
          <SearchBox query={query} setQuery={setQuery} />
          <button
            onClick={() => setFilterOpen(true)}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-soft"
            aria-label="Abrir filtros"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar lg:hidden">
          {QUICK_FILTERS.map((f) => (
            <QuickChip key={f} value={f} active={activeChip === f} onClick={() => setActiveChip(f)} />
          ))}
        </div>
      </header>

      <div className="lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6 xl:grid-cols-[304px_minmax(0,1fr)] xl:gap-8">
        <aside className="hidden lg:block">
          <div className="sticky top-6 max-h-[calc(100dvh-3rem)] space-y-4 overflow-y-auto pr-1 no-scrollbar">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <SearchBox query={query} setQuery={setQuery} />
              <div className="mt-4 flex flex-wrap gap-2">
                {QUICK_FILTERS.map((f) => (
                  <QuickChip key={f} value={f} active={activeChip === f} onClick={() => setActiveChip(f)} />
                ))}
              </div>
            </div>
            
            {/* Passando os novos estados para a Sidebar */}
            <FilterSidebar 
              budget={budget} setBudget={setBudget} 
              selectedNbhd={selectedNbhd} setSelectedNbhd={setSelectedNbhd}
              selectedTypes={selectedTypes} setSelectedTypes={setSelectedTypes}
            />
          </div>
        </aside>

        <div className="min-w-0">
          {filtered.length === 0 ? (
            <div className="mt-10 lg:mt-20">
              <EmptyState
                icon={Search}
                title="Nenhum imóvel encontrado"
                description="Tente ajustar seus filtros de região, tipo ou orçamento para ver mais resultados."
              />
            </div>
          ) : (
            <>
              {top && (
                <section className="px-4 pt-4 lg:px-0 lg:pt-0">
                  <div className="mb-2 flex items-center justify-between">
                    <h2 className="flex items-center gap-1.5 text-sm font-semibold">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      Destaque para você
                    </h2>
                    <span className="text-[11px] text-muted-foreground">{top.match}% compatível</span>
                  </div>
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                    <PropertyCard property={top} variant="hero" />
                  </motion.div>
                </section>
              )}

              {rest.length > 0 && (
                <section className="mt-5 px-4 lg:mt-6 lg:px-0">
                  <div className="mb-3 flex items-end justify-between">
                    <div>
                      <h2 className="text-sm font-semibold">Imóveis compatíveis</h2>
                      <p className="text-[11px] text-muted-foreground lg:text-xs">
                        {rest.length} oportunidades priorizadas por compatibilidade
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0 lg:gap-5 xl:grid-cols-3">
                    {rest.map((p, i) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <PropertyCard property={p} />
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>

      <FilterModal open={filterOpen} onOpenChange={setFilterOpen} />
    </div>
  );
}

function SearchBox({ query, setQuery }: { query: string; setQuery: (value: string) => void }) {
  return (
    <div className="relative flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar bairro, cidade ou imóvel"
        className="h-11 rounded-2xl border-transparent bg-secondary pl-9 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}

function QuickChip({ value, active, onClick }: { value: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition active:scale-95",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/50",
      )}
    >
      {value}
    </button>
  );
}

// ADICIONADAS AS PROPRIEDADES DE ESTADO NO COMPONENTE FILTERSIDEBAR
function FilterSidebar({
  budget,
  setBudget,
  selectedNbhd,
  setSelectedNbhd,
  selectedTypes,
  setSelectedTypes
}: {
  budget: number[];
  setBudget: (value: number[]) => void;
  selectedNbhd: string[];
  setSelectedNbhd: (value: string[]) => void;
  selectedTypes: string[];
  setSelectedTypes: (value: string[]) => void;
}) {

  // Função utilitária para adicionar/remover itens de um array
  const toggleSelection = (item: string, list: string[], setList: (val: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Filtros</h2>
        <span className="text-[11px] text-muted-foreground">Persistentes</span>
      </div>

      <div className="mt-5 space-y-6">
        <FilterSection icon={MapPin} title="Região">
          <div className="flex flex-wrap gap-2">
            {NBHD.map((n) => {
              const isActive = selectedNbhd.includes(n);
              return (
                <button
                  type="button"
                  key={n}
                  onClick={() => toggleSelection(n, selectedNbhd, setSelectedNbhd)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs transition active:scale-95",
                    isActive ? "border-primary bg-primary/10 text-primary font-medium" : "border-border bg-background text-muted-foreground hover:border-primary/50",
                  )}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </FilterSection>

        <FilterSection icon={Home} title="Tipo">
          <div className="grid grid-cols-2 gap-2">
            {TYPES.map((type) => {
              const isActive = selectedTypes.includes(type);
              return (
                <button
                  type="button"
                  key={type}
                  onClick={() => toggleSelection(type, selectedTypes, setSelectedTypes)}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-xs font-medium transition active:scale-95",
                    isActive ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:border-primary/50 text-muted-foreground hover:text-foreground",
                  )}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </FilterSection>

        <FilterSection icon={BedDouble} title="Orçamento">
          <Slider value={budget} onValueChange={setBudget} min={0} max={5000000} step={50000} />
          
          {/* INPUTS DE ORÇAMENTO COM AUTO-SELECT */}
          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1">
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Mínimo
              </label>
              <div className="flex h-9 items-center rounded-xl border border-border bg-background px-2.5 transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                <span className="mr-1.5 text-xs font-medium text-muted-foreground">R$</span>
                <input
                  type="number"
                  value={budget[0]} // Mostra sempre o número real
                  onFocus={(e) => e.target.select()} // Seleciona tudo ao clicar
                  onChange={(e) => {
                    const val = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
                    setBudget([val, budget[1]]);
                  }}
                  onBlur={() => {
                    let min = budget[0];
                    if (min < 0) min = 0;
                    if (min > budget[1]) min = budget[1];
                    setBudget([min, budget[1]]);
                  }}
                  className="w-full bg-transparent text-sm font-semibold outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                />
              </div>
            </div>

            <span className="mt-5 text-muted-foreground">-</span>

            <div className="flex-1">
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Máximo
              </label>
              <div className="flex h-9 items-center rounded-xl border border-border bg-background px-2.5 transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                <span className="mr-1.5 text-xs font-medium text-muted-foreground">R$</span>
                <input
                  type="number"
                  value={budget[1]} // Mostra sempre o número real
                  onFocus={(e) => e.target.select()} // Seleciona tudo ao clicar
                  onChange={(e) => {
                    const val = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
                    setBudget([budget[0], val]);
                  }}
                  onBlur={() => {
                    let max = budget[1];
                    if (max > 5000000) max = 5000000;
                    if (max < budget[0]) max = budget[0];
                    setBudget([budget[0], max]);
                  }}
                  className="w-full bg-transparent text-sm font-semibold outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                />
              </div>
            </div>
          </div>
        </FilterSection>
      </div>
    </div>
  );
}

function FilterSection({
  icon: Icon,
  title,
  children,
}: {
  icon: any;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </div>
      {children}
    </section>
  );
}