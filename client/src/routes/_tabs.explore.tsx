import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Bath,
  Bell,
  BedDouble,
  Car,
  Coins,
  Home,
  MapPin,
  Maximize2,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { EmptyState } from "@/components/emoveis/EmptyState";
import { FilterModal } from "@/components/emoveis/FilterModal";
import { Logo } from "@/components/emoveis/Logo";
import { PropertyCard } from "@/components/emoveis/PropertyCard";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { fmtCurrency, properties } from "@/mock/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_tabs/explore")({
  component: Explore,
});

const QUICK_FILTERS = ["Para voce", "Pet friendly", "Ate R$ 1M", "2 quartos", "Cobertura"];
const NBHD = ["Vila Madalena", "Pinheiros", "Itaim Bibi", "Perdizes", "Vila Olimpia", "Alto de Pinheiros"];
const TYPES = ["Apartamento", "Casa", "Studio", "Cobertura", "Comercial"];
const AMENITIES = ["Piscina", "Academia", "Pet friendly", "Portaria", "Varanda", "Mobiliado", "Churrasqueira", "Coworking"];

export type ExploreFilters = {
  budget: number[];
  selectedNbhd: string[];
  selectedTypes: string[];
  bedrooms: number;
  bathrooms: number;
  parking: number;
  area: number[];
  selectedAmenities: string[];
};

export type ExploreFilterActions = {
  setBudget: (value: number[]) => void;
  setSelectedNbhd: (value: string[]) => void;
  setSelectedTypes: (value: string[]) => void;
  setBedrooms: (value: number) => void;
  setBathrooms: (value: number) => void;
  setParking: (value: number) => void;
  setArea: (value: number[]) => void;
  setSelectedAmenities: (value: string[]) => void;
};

function Explore() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeChip, setActiveChip] = useState("Para voce");
  const [filters, setFilters] = useState<ExploreFilters>({
    budget: [0, 5000000],
    selectedNbhd: [],
    selectedTypes: [],
    bedrooms: 0,
    bathrooms: 0,
    parking: 0,
    area: [0, 400],
    selectedAmenities: [],
  });

  const actions: ExploreFilterActions = {
    setBudget: (budget) => setFilters((current) => ({ ...current, budget })),
    setSelectedNbhd: (selectedNbhd) => setFilters((current) => ({ ...current, selectedNbhd })),
    setSelectedTypes: (selectedTypes) => setFilters((current) => ({ ...current, selectedTypes })),
    setBedrooms: (bedrooms) => setFilters((current) => ({ ...current, bedrooms })),
    setBathrooms: (bathrooms) => setFilters((current) => ({ ...current, bathrooms })),
    setParking: (parking) => setFilters((current) => ({ ...current, parking })),
    setArea: (area) => setFilters((current) => ({ ...current, area })),
    setSelectedAmenities: (selectedAmenities) => setFilters((current) => ({ ...current, selectedAmenities })),
  };

  const applyQuickFilter = (value: string) => {
    setActiveChip(value);
    if (value === "Pet friendly") actions.setSelectedAmenities(["Pet friendly"]);
    if (value === "Ate R$ 1M") actions.setBudget([0, 1000000]);
    if (value === "2 quartos") actions.setBedrooms(2);
    if (value === "Cobertura") actions.setSelectedTypes(["Cobertura"]);
    if (value === "Para voce") {
      setFilters({
        budget: [0, 5000000],
        selectedNbhd: [],
        selectedTypes: [],
        bedrooms: 0,
        bathrooms: 0,
        parking: 0,
        area: [0, 400],
        selectedAmenities: [],
      });
    }
  };

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return properties.filter((property) => {
      const matchesQuery =
        !normalizedQuery ||
        [property.title, property.neighborhood, property.city, property.type]
          .some((value) => String(value).toLowerCase().includes(normalizedQuery));
      const matchesBudget = property.price >= filters.budget[0] && property.price <= filters.budget[1];
      const matchesNbhd = !filters.selectedNbhd.length || filters.selectedNbhd.includes(property.neighborhood);
      const matchesType = !filters.selectedTypes.length || filters.selectedTypes.includes(property.type);
      const matchesBedrooms = !filters.bedrooms || property.bedrooms >= filters.bedrooms;
      const matchesBathrooms = !filters.bathrooms || property.bathrooms >= filters.bathrooms;
      const matchesParking = !filters.parking || property.parking >= filters.parking;
      const matchesArea = property.area >= filters.area[0] && property.area <= filters.area[1];
      const matchesAmenities =
        !filters.selectedAmenities.length ||
        filters.selectedAmenities.every((amenity) =>
          property.amenities.some((item) => item.toLowerCase().includes(amenity.toLowerCase())),
        );

      return (
        matchesQuery &&
        matchesBudget &&
        matchesNbhd &&
        matchesType &&
        matchesBedrooms &&
        matchesBathrooms &&
        matchesParking &&
        matchesArea &&
        matchesAmenities
      );
    });
  }, [query, filters]);

  const top = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div className="pb-2 lg:px-8 lg:py-6">
      <header className="safe-top sticky top-0 z-30 border-b border-border/60 bg-background/95 px-4 pb-3 backdrop-blur-xl lg:static lg:ml-[352px] lg:border-0 lg:bg-transparent lg:px-0 lg:pb-6 lg:pt-0">
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
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Imoveis compativeis para Ana</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Feed inteligente com imoveis, vendedores e corretores alinhados ao perfil.
            </p>
          </div>
          <Link to="/alertas" className="relative grid h-11 w-11 place-items-center rounded-2xl bg-card shadow-soft">
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-primary" />
          </Link>
        </div>

        <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground lg:hidden">
          <MapPin className="h-3 w-3" /> Sao Paulo · regiao central
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
          {QUICK_FILTERS.map((filter) => (
            <QuickChip key={filter} value={filter} active={activeChip === filter} onClick={() => applyQuickFilter(filter)} />
          ))}
        </div>
      </header>

      <div className="lg:grid lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-8">
        <aside className="hidden lg:block">
          <div className="lg:fixed lg:top-6 lg:flex lg:h-[calc(100dvh-3rem)] lg:w-80 lg:flex-col lg:overflow-hidden lg:rounded-3xl lg:border lg:border-border lg:bg-card lg:shadow-soft">
            <div className="shrink-0 border-b border-border/70 p-4">
              <SearchBox query={query} setQuery={setQuery} />
              <div className="mt-4 flex flex-wrap gap-2">
                {QUICK_FILTERS.map((filter) => (
                  <QuickChip key={filter} value={filter} active={activeChip === filter} onClick={() => applyQuickFilter(filter)} />
                ))}
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4 no-scrollbar">
              <FilterSidebar filters={filters} actions={actions} />
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          {!filtered.length ? (
            <div className="mt-10 lg:mt-20">
              <EmptyState icon={Search} title="Nenhum imovel encontrado" description="Tente ajustar regiao, tipo, preco ou estrutura." />
            </div>
          ) : (
            <>
              {top && (
                <section className="px-4 pt-4 lg:px-0 lg:pt-0">
                  <div className="mb-2 flex items-center justify-between">
                    <h2 className="flex items-center gap-1.5 text-sm font-semibold">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      Destaque para voce
                    </h2>
                    <span className="text-[11px] text-muted-foreground">{top.match}% compativel</span>
                  </div>
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                    <PropertyCard property={top} variant="hero" />
                  </motion.div>
                </section>
              )}

              <section className="mt-5 px-4 lg:mt-6 lg:px-0">
                <div className="mb-3 flex items-end justify-between">
                  <div>
                    <h2 className="text-sm font-semibold">Imoveis compativeis</h2>
                    <p className="text-[11px] text-muted-foreground lg:text-xs">
                      {rest.length} oportunidades priorizadas por compatibilidade
                    </p>
                  </div>
                </div>
                <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0 lg:gap-5 xl:grid-cols-3">
                  {rest.map((property, index) => (
                    <motion.div
                      key={property.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                    >
                      <PropertyCard property={property} />
                    </motion.div>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </div>

      <FilterModal open={filterOpen} onOpenChange={setFilterOpen} filters={filters} actions={actions} />
    </div>
  );
}

function SearchBox({ query, setQuery }: { query: string; setQuery: (value: string) => void }) {
  return (
    <div className="relative flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar bairro, cidade ou imovel"
        className="h-11 rounded-2xl border-transparent bg-secondary pl-9 text-sm"
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
        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground",
      )}
    >
      {value}
    </button>
  );
}

function FilterSidebar({ filters, actions }: { filters: ExploreFilters; actions: ExploreFilterActions }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Filtros</h2>
        <span className="text-[11px] text-muted-foreground">Fixos</span>
      </div>

      <div className="mt-5 space-y-6">
        <FilterSection icon={MapPin} title="Regiao">
          <ChipSelector items={NBHD} selected={filters.selectedNbhd} onToggle={(next) => actions.setSelectedNbhd(next)} />
        </FilterSection>

        <FilterSection icon={Home} title="Tipo">
          <ChipSelector items={TYPES} selected={filters.selectedTypes} onToggle={(next) => actions.setSelectedTypes(next)} square />
        </FilterSection>

        <FilterSection icon={Coins} title="Orcamento">
          <RangeFilter value={filters.budget} setValue={actions.setBudget} min={0} max={5000000} step={50000} format={fmtCurrency} />
        </FilterSection>

        <FilterSection icon={BedDouble} title="Estrutura">
          <Stepper label="Quartos" icon={BedDouble} value={filters.bedrooms} setValue={actions.setBedrooms} />
          <Stepper label="Banheiros" icon={Bath} value={filters.bathrooms} setValue={actions.setBathrooms} />
          <Stepper label="Vagas" icon={Car} value={filters.parking} setValue={actions.setParking} />
        </FilterSection>

        <FilterSection icon={Maximize2} title="Area util">
          <RangeFilter value={filters.area} setValue={actions.setArea} min={0} max={400} step={10} suffix="m2" />
        </FilterSection>

        <FilterSection icon={Sparkles} title="Comodidades">
          <ChipSelector items={AMENITIES} selected={filters.selectedAmenities} onToggle={(next) => actions.setSelectedAmenities(next)} />
        </FilterSection>
      </div>
    </div>
  );
}

function FilterSection({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
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

function ChipSelector({
  items,
  selected,
  onToggle,
  square,
}: {
  items: string[];
  selected: string[];
  onToggle: (value: string[]) => void;
  square?: boolean;
}) {
  return (
    <div className={cn(square ? "grid grid-cols-2 gap-2" : "flex flex-wrap gap-2")}>
      {items.map((item) => {
        const active = selected.includes(item);
        return (
          <button
            key={item}
            type="button"
            onClick={() => onToggle(active ? selected.filter((value) => value !== item) : [...selected, item])}
            className={cn(
              square ? "rounded-xl px-3 py-2" : "rounded-full px-3 py-1.5",
              "border text-xs font-medium transition active:scale-95",
              active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground",
            )}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}

function RangeFilter({
  value,
  setValue,
  min,
  max,
  step,
  format,
  suffix,
}: {
  value: number[];
  setValue: (value: number[]) => void;
  min: number;
  max: number;
  step: number;
  format?: (value: number) => string;
  suffix?: string;
}) {
  const display = (number: number) => (format ? format(number) : `${number} ${suffix ?? ""}`.trim());

  return (
    <div>
      <Slider value={value} onValueChange={setValue} min={min} max={max} step={step} />
      <div className="mt-2 flex justify-between text-[11px] font-medium text-muted-foreground">
        <span>{display(value[0])}</span>
        <span>{display(value[1])}</span>
      </div>
    </div>
  );
}

function Stepper({ label, value, setValue, icon: Icon }: { label: string; value: number; setValue: (value: number) => void; icon: any }) {
  return (
    <div className="mb-2 flex items-center justify-between rounded-2xl border border-border bg-background px-3 py-2">
      <div className="flex items-center gap-2 text-xs font-semibold">
        <Icon className="h-3.5 w-3.5 text-primary" />
        {label}
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => setValue(Math.max(0, value - 1))} className="grid h-7 w-7 place-items-center rounded-full bg-secondary text-xs font-bold">
          -
        </button>
        <span className="w-5 text-center text-sm font-bold">{value}</span>
        <button type="button" onClick={() => setValue(value + 1)} className="grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          +
        </button>
      </div>
    </div>
  );
}
