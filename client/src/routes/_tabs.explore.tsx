import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
import { findManyPreferences } from "@/services/preferences";
import { Logo } from "@/components/emoveis/Logo";
import { PropertyCard } from "@/components/emoveis/PropertyCard";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { fmtCurrency } from "@/mock/data";
import api from "@/services/api";
import { mapOffersToProperties, readOffersPayload } from "@/lib/offer-mappers";
import { cn } from "@/lib/utils";
import { citiesForState, DEFAULT_CITY, DEFAULT_STATE, stateLabel, STATE_OPTIONS } from "@/lib/location-options";

export const Route = createFileRoute("/_tabs/explore")({
  component: Explore,
});

const PURPOSE_FILTERS = [
  { label: "Comprar", value: "SALE" },
  { label: "Alugar", value: "RENT" },
] as const;
const TYPES = ["Apartamento", "Casa", "Studio", "Cobertura", "Comercial"];
const AMENITIES = ["Piscina", "Academia", "Pet friendly", "Portaria", "Varanda", "Mobiliado", "Churrasqueira", "Coworking", "Playground", "Area de servico"];


const normalizeLocation = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const preferenceTypeLabels: Record<string, string> = {
  APARTAMENTO: "Apartamento",
  CASA: "Casa",
  STUDIO: "Studio",
  COBERTURA: "Cobertura",
  TERRENO: "Comercial",
};

const preferenceAmenityLabels: Record<string, string> = {
  PISCINA: "Piscina",
  ACADEMIA: "Academia",
  CHURRASQUEIRA: "Churrasqueira",
  ELEVADOR: "Portaria",
  PORTARIA: "Portaria",
  PORTARIA_24H: "Portaria",
  MOBILIADO: "Mobiliado",
  PET_FRIENDLY: "Pet friendly",
  VARANDA: "Varanda",
  AREA_SERVICO: "Area de servico",
  PLAYGROUND: "Playground",
};

export type ExploreFilters = {
  budget: number[];
  selectedState: string;
  selectedCity: string;
  selectedTypes: string[];
  bedrooms: number;
  bathrooms: number;
  parking: number;
  area: number[];
  selectedAmenities: string[];
};

export type ExploreFilterActions = {
  setBudget: (value: number[]) => void;
  setSelectedState: (value: string) => void;
  setSelectedCity: (value: string) => void;
  setSelectedTypes: (value: string[]) => void;
  setBedrooms: (value: number) => void;
  setBathrooms: (value: number) => void;
  setParking: (value: number) => void;
  setArea: (value: number[]) => void;
  setSelectedAmenities: (value: string[]) => void;
};

type AuthProfile = { name: string; email: string };
type ListingPurpose = (typeof PURPOSE_FILTERS)[number]["value"];

function Explore() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [listingPurpose, setListingPurpose] = useState<ListingPurpose>("SALE");
  const [availableProperties, setAvailableProperties] = useState<ReturnType<typeof mapOffersToProperties>>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [profileName, setProfileName] = useState("voce");
  const [filters, setFilters] = useState<ExploreFilters>({
    budget: [0, 5000000],
    selectedState: DEFAULT_STATE,
    selectedCity: DEFAULT_CITY,
    selectedTypes: [],
    bedrooms: 0,
    bathrooms: 0,
    parking: 0,
    area: [0, 400],
    selectedAmenities: [],
  });

  const actions: ExploreFilterActions = {
    setBudget: (budget) => setFilters((current) => ({ ...current, budget })),
    setSelectedState: (selectedState) => setFilters((current) => ({ ...current, selectedState, selectedCity: citiesForState(selectedState)[0] ?? "" })),
    setSelectedCity: (selectedCity) => setFilters((current) => ({ ...current, selectedCity })),
    setSelectedTypes: (selectedTypes) => setFilters((current) => ({ ...current, selectedTypes })),
    setBedrooms: (bedrooms) => setFilters((current) => ({ ...current, bedrooms })),
    setBathrooms: (bathrooms) => setFilters((current) => ({ ...current, bathrooms })),
    setParking: (parking) => setFilters((current) => ({ ...current, parking })),
    setArea: (area) => setFilters((current) => ({ ...current, area })),
    setSelectedAmenities: (selectedAmenities) => setFilters((current) => ({ ...current, selectedAmenities })),
  };


  useEffect(() => {
    let mounted = true;

    api
      .get<AuthProfile>("/auth/profile")
      .then(({ data }) => {
        if (!mounted) return;
        const firstName = data.name?.trim().split(/\s+/)[0];
        setProfileName(firstName || "voce");
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    findManyPreferences()
      .then((preferences) => {
        if (!mounted || !preferences.length) return;
        const active = preferences.find((preference) => preference.isActive) ?? preferences[0];
        const state = active.state || DEFAULT_STATE;
        const city = active.city || citiesForState(state)[0] || DEFAULT_CITY;

        setFilters((current) => ({
          ...current,
          selectedState: state,
          selectedCity: city,
          selectedTypes: (active.propertyTypes ?? []).map((type) => preferenceTypeLabels[type]).filter(Boolean),
          selectedAmenities: (active.desiredAmenities ?? []).map((amenity) => preferenceAmenityLabels[amenity]).filter(Boolean),
          budget: [Number(active.minPrice ?? current.budget[0]), Number(active.maxPrice ?? current.budget[1])],
          area: [Number(active.minAreaM2 ?? current.area[0]), Number(active.maxAreaM2 ?? current.area[1])],
          bedrooms: Number(active.minBedrooms ?? current.bedrooms),
          bathrooms: Number(active.minBathrooms ?? current.bathrooms),
          parking: Number(active.minParkingSpots ?? current.parking),
        }));
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadOffers() {
      try {
        setLoadingOffers(true);
        const { data } = await api.get("/offers", {
          params: { status: "ATIVA", limit: 1000 },
        });
        const offers = readOffersPayload(data);
        if (mounted) setAvailableProperties(mapOffersToProperties(offers));
      } catch {
        if (mounted) setAvailableProperties([]);
      } finally {
        if (mounted) setLoadingOffers(false);
      }
    }

    void loadOffers();

    return () => {
      mounted = false;
    };
  }, []);


  const filtered = useMemo(() => {
    const normalizedQuery = normalizeLocation(query);

    return availableProperties.filter((property) => {
      const matchesQuery =
        !normalizedQuery ||
        [property.title, property.neighborhood, property.city, property.type]
          .some((value) => normalizeLocation(String(value)).includes(normalizedQuery));
      const normalizedPropertyCity = normalizeLocation(property.city);
      const looksLikeSaoPaulo = normalizedPropertyCity === "sao paulo" || property.city.toLowerCase().includes("paulo");
      const propertyState = property.state ?? (looksLikeSaoPaulo ? "SP" : "");
      const matchesState = !filters.selectedState || propertyState === filters.selectedState;
      const matchesCity = !filters.selectedCity || normalizedPropertyCity === normalizeLocation(filters.selectedCity) || (looksLikeSaoPaulo && normalizeLocation(filters.selectedCity) === "sao paulo");
      const matchesPurpose = property.listingPurpose === listingPurpose;
      const matchesBudget = property.price >= filters.budget[0] && property.price <= filters.budget[1];
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
        matchesPurpose &&
        matchesState &&
        matchesCity &&
        matchesBudget &&
        matchesType &&
        matchesBedrooms &&
        matchesBathrooms &&
        matchesParking &&
        matchesArea &&
        matchesAmenities
      );
    });
  }, [availableProperties, query, filters, listingPurpose]);

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
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Imoveis compativeis para {profileName}</h1>
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
          <MapPin className="h-3 w-3" /> {filters.selectedCity} · {stateLabel(filters.selectedState)}
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
          <PurposeToggle value={listingPurpose} onChange={setListingPurpose} />
        </div>
      </header>

      <div className="lg:grid lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-8">
        <aside className="hidden lg:block">
          <div className="lg:fixed lg:top-6 lg:flex lg:h-[calc(100dvh-3rem)] lg:w-80 lg:flex-col lg:overflow-hidden lg:rounded-3xl lg:border lg:border-border lg:bg-card lg:shadow-soft">
            <div className="shrink-0 border-b border-border/70 p-4">
              <SearchBox query={query} setQuery={setQuery} />
              <div className="mt-4 flex flex-wrap gap-2">
                <PurposeToggle value={listingPurpose} onChange={setListingPurpose} />
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
                      {loadingOffers ? "Carregando ofertas..." : `${rest.length} oportunidades priorizadas por compatibilidade`}
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

function PurposeToggle({ value, onChange }: { value: ListingPurpose; onChange: (value: ListingPurpose) => void }) {
  return (
    <div className="grid w-full grid-cols-2 gap-1 rounded-2xl border border-border bg-card p-1 shadow-sm">
      {PURPOSE_FILTERS.map((item) => {
        const active = value === item.value;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={cn(
              "rounded-xl px-3 py-2 text-xs font-bold transition active:scale-95",
              active ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
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
        <FilterSection icon={MapPin} title="Localizacao">
          <div className="space-y-3">
            <div>
              <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Estado</div>
              <SingleChipSelector
                items={STATE_OPTIONS.map((state) => ({ label: state.label, value: state.value }))}
                selected={filters.selectedState}
                onSelect={actions.setSelectedState}
              />
            </div>
            <div>
              <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Cidade</div>
              <SingleChipSelector
                items={citiesForState(filters.selectedState).map((city) => ({ label: city, value: city }))}
                selected={filters.selectedCity}
                onSelect={actions.setSelectedCity}
              />
            </div>
          </div>
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

function SingleChipSelector({
  items,
  selected,
  onSelect,
}: {
  items: { label: string; value: string }[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const active = selected === item.value;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onSelect(item.value)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition active:scale-95",
              active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
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



