import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bath,
  BedDouble,
  Car,
  ChevronDown,
  CircleDollarSign,
  Home,
  MapPin,
  Minus,
  Plus,
  Ruler,
  Search,
} from "lucide-react";
import { Button } from "@/shared/components/Button";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/shared/components/StateBlocks";
import {
  AMENITIES,
  AMENITY_LABEL,
  PROPERTY_TYPES,
  PROPERTY_TYPE_LABEL,
  type Amenity,
  type PropertyType,
} from "@/shared/constants/enums";
import { getApiErrorMessage } from "@/shared/api/httpClient";
import type { Offer } from "@/shared/types/domain";
import { cn } from "@/shared/utils/cn";
import { formatCurrency } from "@/shared/utils/format";
import {
  getNegotiatedOfferIds,
  syncAcceptedProposalsAsNegotiated,
} from "@/shared/utils/negotiationStorage";
import { ProposalFormDialog } from "@/modules/proposals/pages/ProposalFormDialog";
import { getMyProposals } from "@/modules/proposals/api/proposalsApi";
import { useAuth } from "@/modules/auth/components/AuthProvider";
import { OfferCard } from "../components/OfferCard";
import { getOffers } from "../api/offersApi";

type CityOption = {
  key: string;
  label: string;
  city: string;
  state: string;
};

function cityKey(city: string, state: string) {
  return `${city.trim()}|||${state.trim().toUpperCase()}`;
}

function normalizeText(value?: string | null) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function toNumber(value: unknown) {
  return Number(value || 0);
}

export function DiscoverPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedCityKey, setSelectedCityKey] = useState("");
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>(
    [],
  );
  const [propertyType, setPropertyType] = useState<PropertyType | "">("");
  const [bedrooms, setBedrooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(0);
  const [parkingSpots, setParkingSpots] = useState(0);
  const [minAreaM2, setMinAreaM2] = useState(0);
  const [maxAreaM2, setMaxAreaM2] = useState(500);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1500000);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [negotiatedOfferIds, setNegotiatedOfferIds] = useState(() =>
    getNegotiatedOfferIds(),
  );

  const offersQuery = useQuery({
    queryKey: ["offers", "discover", "all"],
    queryFn: () => getOffers(),
  });

  const proposalsQuery = useQuery({
    queryKey: ["proposals", "sent", "discover"],
    queryFn: getMyProposals,
  });

  const visibleBaseOffers = useMemo(() => {
    return (offersQuery.data ?? []).filter((offer) => {
      const isOwnOffer = Boolean(
        user?.id && (offer.userId === user.id || offer.user?.id === user.id),
      );
      return !isOwnOffer;
    });
  }, [offersQuery.data, user?.id]);

  const acceptedOfferIds = useMemo(() => {
    return new Set(
      (proposalsQuery.data ?? [])
        .filter((proposal) => proposal.status === "ACEITA")
        .map((proposal) => proposal.offerId),
    );
  }, [proposalsQuery.data]);

  const pendingOfferIds = useMemo(() => {
    return new Set(
      (proposalsQuery.data ?? [])
        .filter((proposal) => proposal.status === "PENDENTE")
        .map((proposal) => proposal.offerId),
    );
  }, [proposalsQuery.data]);

  useEffect(() => {
    function refreshNegotiatedOffers() {
      setNegotiatedOfferIds(getNegotiatedOfferIds());
    }

    window.addEventListener("storage", refreshNegotiatedOffers);
    window.addEventListener(
      "portal-emoveis:negotiations-updated",
      refreshNegotiatedOffers,
    );

    return () => {
      window.removeEventListener("storage", refreshNegotiatedOffers);
      window.removeEventListener(
        "portal-emoveis:negotiations-updated",
        refreshNegotiatedOffers,
      );
    };
  }, []);

  useEffect(() => {
    syncAcceptedProposalsAsNegotiated(proposalsQuery.data);
    setNegotiatedOfferIds(getNegotiatedOfferIds());
  }, [proposalsQuery.data]);

  const cityOptions = useMemo<CityOption[]>(() => {
    const map = new Map<string, CityOption>();

    visibleBaseOffers.forEach((offer) => {
      if (!offer.city || !offer.state) return;
      const key = cityKey(offer.city, offer.state);
      map.set(key, {
        key,
        city: offer.city,
        state: offer.state,
        label: `${offer.city} - ${offer.state}`,
      });
    });

    return Array.from(map.values()).sort((a, b) =>
      a.label.localeCompare(b.label),
    );
  }, [visibleBaseOffers]);

  const selectedCity = cityOptions.find((city) => city.key === selectedCityKey);

  const neighborhoodOptions = useMemo(() => {
    const neighborhoods = new Set<string>();

    visibleBaseOffers.forEach((offer) => {
      const matchCity =
        !selectedCity ||
        (offer.city === selectedCity.city &&
          offer.state === selectedCity.state);
      if (matchCity && offer.neighborhood)
        neighborhoods.add(offer.neighborhood);
    });

    return Array.from(neighborhoods).sort((a, b) => a.localeCompare(b));
  }, [selectedCity, visibleBaseOffers]);

  const maxRegisteredPrice = useMemo(
    () =>
      Math.max(
        1500000,
        ...visibleBaseOffers.map((offer) => toNumber(offer.price)),
      ),
    [visibleBaseOffers],
  );

  const filteredOffers = useMemo(() => {
    const term = normalizeText(search);

    return visibleBaseOffers.filter((offer) => {
      const text = [
        offer.title,
        offer.neighborhood,
        offer.city,
        offer.state,
        offer.description ?? "",
      ]
        .join(" ")
        .toLowerCase();
      const matchSearch = !term || text.includes(term);
      const matchCity =
        !selectedCity ||
        (offer.city === selectedCity.city &&
          offer.state === selectedCity.state);
      const matchNeighborhood =
        selectedNeighborhoods.length === 0 ||
        selectedNeighborhoods.includes(offer.neighborhood);
      const matchType = !propertyType || offer.propertyType === propertyType;
      const matchBedrooms = bedrooms === 0 || offer.bedrooms >= bedrooms;
      const matchBathrooms = bathrooms === 0 || offer.bathrooms >= bathrooms;
      const matchParking =
        parkingSpots === 0 || offer.parkingSpots >= parkingSpots;
      const matchArea = offer.areaM2 >= minAreaM2 && offer.areaM2 <= maxAreaM2;
      const offerPrice = toNumber(offer.price);
      const matchPrice = offerPrice >= minPrice && offerPrice <= maxPrice;
      const matchAmenities =
        amenities.length === 0 ||
        amenities.every((amenity) => offer.amenities?.includes(amenity));

      return (
        matchSearch &&
        matchCity &&
        matchNeighborhood &&
        matchType &&
        matchBedrooms &&
        matchBathrooms &&
        matchParking &&
        matchArea &&
        matchPrice &&
        matchAmenities
      );
    });
  }, [
    amenities,
    bathrooms,
    bedrooms,
    maxAreaM2,
    maxPrice,
    minAreaM2,
    minPrice,
    parkingSpots,
    propertyType,
    search,
    selectedCity,
    selectedNeighborhoods,
    visibleBaseOffers,
  ]);

  function clearFilters() {
    setSearch("");
    setSelectedCityKey("");
    setSelectedNeighborhoods([]);
    setPropertyType("");
    setBedrooms(0);
    setBathrooms(0);
    setParkingSpots(0);
    setMinAreaM2(0);
    setMaxAreaM2(500);
    setMinPrice(0);
    setMaxPrice(maxRegisteredPrice);
    setAmenities([]);
  }

  function handleCityChange(value: string) {
    setSelectedCityKey(value);
    setSelectedNeighborhoods([]);
  }

  return (
    <div>
      <header className="mb-6 max-w-4xl">
        <p className="text-sm font-bold uppercase tracking-[0.24em] text-primary">
          Explorar
        </p>
        <h1 className="mt-3 font-display text-4xl font-black tracking-tight text-foreground sm:text-5xl">
          Imóveis compatíveis para {user?.name?.split(" ")[0] ?? "você"}
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
          Explore ofertas cadastradas e use os filtros para encontrar opções
          fora do fluxo automático de matches.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[340px_1fr] xl:items-start">
        <FilterPanel
          search={search}
          onSearch={setSearch}
          cityOptions={cityOptions}
          selectedCityKey={selectedCityKey}
          onCityChange={handleCityChange}
          neighborhoodOptions={neighborhoodOptions}
          selectedNeighborhoods={selectedNeighborhoods}
          onNeighborhoodsChange={setSelectedNeighborhoods}
          propertyType={propertyType}
          onPropertyTypeChange={setPropertyType}
          bedrooms={bedrooms}
          onBedroomsChange={setBedrooms}
          bathrooms={bathrooms}
          onBathroomsChange={setBathrooms}
          parkingSpots={parkingSpots}
          onParkingSpotsChange={setParkingSpots}
          minAreaM2={minAreaM2}
          maxAreaM2={maxAreaM2}
          onMinAreaM2Change={setMinAreaM2}
          onMaxAreaM2Change={setMaxAreaM2}
          minPrice={minPrice}
          maxPrice={maxPrice}
          priceLimit={maxRegisteredPrice}
          onMinPriceChange={setMinPrice}
          onMaxPriceChange={setMaxPrice}
          amenities={amenities}
          onAmenitiesChange={setAmenities}
          onClear={clearFilters}
        />

        <section>
          {offersQuery.isLoading ? (
            <LoadingState message="Carregando imóveis cadastrados..." />
          ) : null}
          {offersQuery.isError ? (
            <ErrorState
              message={getApiErrorMessage(offersQuery.error)}
              onRetry={() => void offersQuery.refetch()}
            />
          ) : null}

          {!offersQuery.isLoading &&
          !offersQuery.isError &&
          filteredOffers.length === 0 ? (
            <EmptyState
              title="Nenhum imóvel encontrado"
              description="Altere os filtros ou volte mais tarde para ver novas ofertas."
              action={
                <Button
                  type="button"
                  onClick={() => window.location.assign("/preferences")}
                >
                  Ajustar interesses
                </Button>
              }
            />
          ) : null}

          {filteredOffers.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
              {filteredOffers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  onContact={setSelectedOffer}
                  negotiation={
                    negotiatedOfferIds.has(offer.id) ||
                    acceptedOfferIds.has(offer.id) ||
                    Boolean(offer.status && offer.status !== "ATIVA")
                  }
                />
              ))}
            </div>
          ) : null}
        </section>
      </div>

      {selectedOffer &&
      !negotiatedOfferIds.has(selectedOffer.id) &&
      !acceptedOfferIds.has(selectedOffer.id) &&
      !pendingOfferIds.has(selectedOffer.id) &&
      (!selectedOffer.status || selectedOffer.status === "ATIVA") ? (
        <ProposalFormDialog
          offerId={selectedOffer.id}
          offerTitle={selectedOffer.title}
          onClose={() => setSelectedOffer(null)}
        />
      ) : null}
    </div>
  );
}

type FilterPanelProps = {
  search: string;
  onSearch: (value: string) => void;
  cityOptions: CityOption[];
  selectedCityKey: string;
  onCityChange: (value: string) => void;
  neighborhoodOptions: string[];
  selectedNeighborhoods: string[];
  onNeighborhoodsChange: (value: string[]) => void;
  propertyType: PropertyType | "";
  onPropertyTypeChange: (value: PropertyType | "") => void;
  bedrooms: number;
  onBedroomsChange: (value: number) => void;
  bathrooms: number;
  onBathroomsChange: (value: number) => void;
  parkingSpots: number;
  onParkingSpotsChange: (value: number) => void;
  minAreaM2: number;
  maxAreaM2: number;
  onMinAreaM2Change: (value: number) => void;
  onMaxAreaM2Change: (value: number) => void;
  minPrice: number;
  maxPrice: number;
  priceLimit: number;
  onMinPriceChange: (value: number) => void;
  onMaxPriceChange: (value: number) => void;
  amenities: Amenity[];
  onAmenitiesChange: (value: Amenity[]) => void;
  onClear: () => void;
};

function FilterPanel({
  search,
  onSearch,
  cityOptions,
  selectedCityKey,
  onCityChange,
  neighborhoodOptions,
  selectedNeighborhoods,
  onNeighborhoodsChange,
  propertyType,
  onPropertyTypeChange,
  bedrooms,
  onBedroomsChange,
  bathrooms,
  onBathroomsChange,
  parkingSpots,
  onParkingSpotsChange,
  minAreaM2,
  maxAreaM2,
  onMinAreaM2Change,
  onMaxAreaM2Change,
  minPrice,
  maxPrice,
  priceLimit,
  onMinPriceChange,
  onMaxPriceChange,
  amenities,
  onAmenitiesChange,
  onClear,
}: FilterPanelProps) {
  return (
    <section className="sticky top-6 rounded-[1.6rem] border border-border bg-card p-4 shadow-card">
      <div className="flex h-11 items-center gap-3 rounded-2xl border border-input bg-secondary px-3 shadow-sm focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
        <Search className="size-4 text-muted-foreground" />
        <input
          className="h-full min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Buscar bairro, cidade ou imóvel"
        />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <h2 className="text-base font-black text-foreground">Filtros</h2>
        <button
          type="button"
          className="text-xs font-bold text-muted-foreground hover:text-primary"
          onClick={onClear}
        >
          Limpar
        </button>
      </div>

      <div className="mt-4 max-h-[calc(100vh-210px)] overflow-y-auto pr-1">
        <div className="grid gap-5">
          <CompactSection
            icon={<MapPin className="size-4" />}
            title="Localização"
          >
            <label className="grid gap-1.5 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
              Cidade
              <select
                className="h-10 rounded-xl border border-input bg-card px-3 text-sm font-semibold normal-case tracking-normal text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                value={selectedCityKey}
                onChange={(event) => onCityChange(event.target.value)}
              >
                <option value="">Todas as cidades</option>
                {cityOptions.map((city) => (
                  <option key={city.key} value={city.key}>
                    {city.label}
                  </option>
                ))}
              </select>
            </label>

            <DropdownChecklist
              label="Bairros"
              placeholder="Selecionar bairros"
              options={neighborhoodOptions}
              value={selectedNeighborhoods}
              onChange={onNeighborhoodsChange}
            />
          </CompactSection>

          <CompactSection icon={<Home className="size-4" />} title="Tipo">
            <select
              className="h-10 w-full rounded-xl border border-input bg-card px-3 text-sm font-semibold text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              value={propertyType}
              onChange={(event) =>
                onPropertyTypeChange(event.target.value as PropertyType | "")
              }
            >
              <option value="">Todos os tipos</option>
              {PROPERTY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {PROPERTY_TYPE_LABEL[type]}
                </option>
              ))}
            </select>
          </CompactSection>

          <CompactSection
            icon={<CircleDollarSign className="size-4" />}
            title="Financeiro"
          >
            <RangePair
              min={minPrice}
              max={maxPrice}
              limit={priceLimit}
              step={10000}
              formatter={formatCurrency}
              onMinChange={onMinPriceChange}
              onMaxChange={onMaxPriceChange}
            />
          </CompactSection>

          <CompactSection
            icon={<BedDouble className="size-4" />}
            title="Estrutura"
          >
            <div className="grid gap-2">
              <StepperFilter
                label="Quartos"
                value={bedrooms}
                onChange={onBedroomsChange}
                icon={<BedDouble className="size-4" />}
              />
              <StepperFilter
                label="Banheiros"
                value={bathrooms}
                onChange={onBathroomsChange}
                icon={<Bath className="size-4" />}
              />
              <StepperFilter
                label="Vagas"
                value={parkingSpots}
                onChange={onParkingSpotsChange}
                icon={<Car className="size-4" />}
              />
            </div>
          </CompactSection>

          <CompactSection icon={<Ruler className="size-4" />} title="Área útil">
            <RangePair
              min={minAreaM2}
              max={maxAreaM2}
              limit={500}
              step={10}
              formatter={(value) => `${value} m²`}
              onMinChange={onMinAreaM2Change}
              onMaxChange={onMaxAreaM2Change}
            />
          </CompactSection>

          <CompactSection
            icon={<Home className="size-4" />}
            title="Comodidades"
          >
            <DropdownChecklist
              label="Comodidades"
              placeholder="Selecionar comodidades"
              options={AMENITIES.map((amenity) => AMENITY_LABEL[amenity])}
              value={amenities.map((amenity) => AMENITY_LABEL[amenity])}
              onChange={(labels) =>
                onAmenitiesChange(
                  AMENITIES.filter((amenity) =>
                    labels.includes(AMENITY_LABEL[amenity]),
                  ),
                )
              }
            />
          </CompactSection>
        </div>
      </div>
    </section>
  );
}

function CompactSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-3">
      <h3 className="flex items-center gap-2 font-display text-sm font-black text-foreground">
        <span className="text-primary">{icon}</span>
        {title}
      </h3>
      {children}
    </section>
  );
}

function DropdownChecklist({
  label,
  placeholder,
  options,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const selectedText =
    value.length > 0 ? `${value.length} selecionado(s)` : placeholder;

  function toggle(option: string) {
    if (value.includes(option)) {
      onChange(value.filter((item) => item !== option));
      return;
    }
    onChange([...value, option]);
  }

  return (
    <details className="group relative">
      <summary className="flex h-10 cursor-pointer list-none items-center justify-between rounded-xl border border-input bg-card px-3 text-sm font-semibold text-foreground outline-none transition hover:border-primary/50">
        <span className={cn(value.length === 0 && "text-muted-foreground")}>
          {selectedText}
        </span>
        <ChevronDown className="size-4 text-muted-foreground transition group-open:rotate-180" />
      </summary>
      <div className="absolute z-20 mt-2 max-h-56 w-full overflow-y-auto rounded-2xl border border-border bg-card p-2 shadow-card">
        {options.length === 0 ? (
          <p className="px-3 py-2 text-sm text-muted-foreground">
            Nenhuma opção cadastrada
          </p>
        ) : null}
        {options.map((option) => (
          <label
            key={`${label}-${option}`}
            className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <input
              type="checkbox"
              checked={value.includes(option)}
              onChange={() => toggle(option)}
              className="accent-primary"
            />
            {option}
          </label>
        ))}
      </div>
    </details>
  );
}

function StepperFilter({
  label,
  value,
  onChange,
  icon,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  icon: ReactNode;
}) {
  return (
    <div className="flex h-12 items-center justify-between rounded-2xl border border-input bg-card px-3">
      <div className="flex items-center gap-2 text-sm font-extrabold text-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="grid size-8 place-items-center rounded-full bg-secondary text-foreground transition hover:bg-primary hover:text-primary-foreground"
          onClick={() => onChange(Math.max(0, value - 1))}
        >
          <Minus className="size-4" />
        </button>
        <span className="w-6 text-center text-sm font-black text-foreground">
          {value}
        </span>
        <button
          type="button"
          className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm shadow-primary/20 transition hover:opacity-90"
          onClick={() => onChange(value + 1)}
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  );
}

function RangePair({
  min,
  max,
  limit,
  step,
  formatter,
  onMinChange,
  onMaxChange,
}: {
  min: number;
  max: number;
  limit: number;
  step: number;
  formatter: (value: number) => string;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
}) {
  return (
    <div className="rounded-2xl bg-secondary/70 p-3">
      <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
        <span>{formatter(min)}</span>
        <span>{formatter(max)}</span>
      </div>
      <input
        aria-label="Valor mínimo"
        className="mt-3 w-full accent-primary"
        type="range"
        min={0}
        max={limit}
        step={step}
        value={min}
        onChange={(event) =>
          onMinChange(Math.min(Number(event.target.value), max))
        }
      />
      <input
        aria-label="Valor máximo"
        className="w-full accent-primary"
        type="range"
        min={0}
        max={limit}
        step={step}
        value={max}
        onChange={(event) =>
          onMaxChange(Math.max(Number(event.target.value), min))
        }
      />
    </div>
  );
}
