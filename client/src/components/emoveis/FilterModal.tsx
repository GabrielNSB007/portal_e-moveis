import { Bath, BedDouble, Car, Coins, Home, MapPin, Maximize2, Sparkles, X } from "lucide-react";
import { fmtCurrency } from "@/mock/data";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import type { ExploreFilterActions, ExploreFilters } from "@/routes/_tabs.explore";

const TYPES = ["Apartamento", "Casa", "Studio", "Cobertura", "Comercial"];
const NBHD = ["Vila Madalena", "Pinheiros", "Itaim Bibi", "Perdizes", "Vila Olimpia", "Alto de Pinheiros"];
const AMENITIES = ["Piscina", "Academia", "Pet friendly", "Portaria", "Varanda", "Mobiliado", "Churrasqueira", "Coworking"];

export function FilterModal({
  open,
  onOpenChange,
  filters,
  actions,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: ExploreFilters;
  actions: ExploreFilterActions;
}) {
  if (!open) return null;

  const reset = () => {
    actions.setBudget([0, 5000000]);
    actions.setSelectedNbhd([]);
    actions.setSelectedTypes([]);
    actions.setBedrooms(0);
    actions.setBathrooms(0);
    actions.setParking(0);
    actions.setArea([0, 400]);
    actions.setSelectedAmenities([]);
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        aria-label="Fechar filtros"
        className="absolute inset-0 bg-black/45"
        onClick={() => onOpenChange(false)}
      />

      <div className="absolute inset-x-0 bottom-0 flex max-h-[90dvh] flex-col overflow-hidden rounded-t-3xl border-t border-border bg-background shadow-card">
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-lg font-semibold">Filtros</h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="grid h-10 w-10 place-items-center rounded-full bg-secondary"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 py-4">
          <Section icon={MapPin} title="Bairros">
            <Chips items={NBHD} selected={filters.selectedNbhd} onToggle={actions.setSelectedNbhd} />
          </Section>

          <Section icon={Home} title="Tipo">
            <Chips items={TYPES} selected={filters.selectedTypes} onToggle={actions.setSelectedTypes} />
          </Section>

          <Section icon={Coins} title="Orcamento">
            <Slider value={filters.budget} onValueChange={actions.setBudget} min={0} max={5000000} step={50000} />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>{fmtCurrency(filters.budget[0])}</span>
              <span>{fmtCurrency(filters.budget[1])}</span>
            </div>
          </Section>

          <Section icon={BedDouble} title="Estrutura">
            <Stepper label="Quartos" icon={BedDouble} value={filters.bedrooms} setValue={actions.setBedrooms} />
            <Stepper label="Banheiros" icon={Bath} value={filters.bathrooms} setValue={actions.setBathrooms} />
            <Stepper label="Vagas" icon={Car} value={filters.parking} setValue={actions.setParking} />
          </Section>

          <Section icon={Maximize2} title="Area util">
            <Slider value={filters.area} onValueChange={actions.setArea} min={0} max={400} step={10} />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>{filters.area[0]} m2</span>
              <span>{filters.area[1]} m2</span>
            </div>
          </Section>

          <Section icon={Sparkles} title="Comodidades">
            <Chips items={AMENITIES} selected={filters.selectedAmenities} onToggle={actions.setSelectedAmenities} />
          </Section>
        </div>

        <div className="flex shrink-0 gap-2 border-t border-border bg-background/95 p-4 safe-bottom">
          <Button variant="outline" className="h-11 flex-1 rounded-2xl" onClick={reset}>
            Limpar
          </Button>
          <Button className="h-11 flex-1 rounded-2xl bg-gradient-primary" onClick={() => onOpenChange(false)}>
            Aplicar filtros
          </Button>
        </div>
      </div>
    </div>
  );
}

function Section({
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
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </h3>
      {children}
    </section>
  );
}

function Chips({
  items,
  selected,
  onToggle,
}: {
  items: string[];
  selected: string[];
  onToggle: (value: string[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const active = selected.includes(item);
        return (
          <button
            key={item}
            type="button"
            onClick={() => onToggle(active ? selected.filter((value) => value !== item) : [...selected, item])}
            className={cn(
              "rounded-full border px-3.5 py-2 text-sm transition active:scale-95",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:bg-secondary",
            )}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}

function Stepper({
  label,
  value,
  setValue,
  icon: Icon,
}: {
  label: string;
  value: number;
  setValue: (value: number) => void;
  icon: any;
}) {
  return (
    <div className="mb-2 flex items-center justify-between rounded-2xl border border-border bg-card px-3 py-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Icon className="h-4 w-4 text-primary" />
        {label}
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => setValue(Math.max(0, value - 1))} className="grid h-8 w-8 place-items-center rounded-full bg-secondary font-bold">
          -
        </button>
        <span className="w-6 text-center font-bold">{value}</span>
        <button type="button" onClick={() => setValue(value + 1)} className="grid h-8 w-8 place-items-center rounded-full bg-primary font-bold text-primary-foreground">
          +
        </button>
      </div>
    </div>
  );
}
