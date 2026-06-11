import { X } from "lucide-react";
import { useState } from "react";
import { fmtCurrency } from "@/mock/data";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const TYPES = ["Apartamento", "Casa", "Studio", "Cobertura", "Comercial"];
const NBHD = ["Vila Madalena", "Pinheiros", "Itaim Bibi", "Perdizes", "Vila Olimpia", "Alto de Pinheiros"];
const AMEN = ["Piscina", "Academia", "Pet friendly", "Seguranca 24h", "Coworking", "Quintal"];

export function FilterModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [budget, setBudget] = useState([300000, 1500000]);
  const [rooms, setRooms] = useState(2);
  const [types, setTypes] = useState<string[]>(["Apartamento"]);
  const [nbhd, setNbhd] = useState<string[]>([]);
  const [amen, setAmen] = useState<string[]>([]);

  if (!open) return null;

  const toggle = (arr: string[], value: string, set: (next: string[]) => void) => {
    set(arr.includes(value) ? arr.filter((item) => item !== value) : [...arr, value]);
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        aria-label="Fechar filtros"
        className="absolute inset-0 bg-black/45"
        onClick={() => onOpenChange(false)}
      />

      <div className="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-hidden rounded-t-3xl border-t border-border bg-background shadow-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
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

        <div className="max-h-[calc(88dvh-8.5rem)] space-y-6 overflow-y-auto px-4 py-4">
          <Section title="Orcamento">
            <Slider
              value={budget}
              onValueChange={setBudget}
              min={100000}
              max={3000000}
              step={50000}
            />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>{fmtCurrency(budget[0])}</span>
              <span>{fmtCurrency(budget[1])}</span>
            </div>
          </Section>

          <Section title="Bairros">
            <Chips items={NBHD} selected={nbhd} onToggle={(value) => toggle(nbhd, value, setNbhd)} />
          </Section>

          <Section title="Tipo">
            <Chips items={TYPES} selected={types} onToggle={(value) => toggle(types, value, setTypes)} />
          </Section>

          <Section title="Quartos">
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, "4+"].map((item) => {
                const value = Number(String(item).replace("+", ""));
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setRooms(value)}
                    className={cn(
                      "h-11 rounded-xl border text-sm font-medium transition",
                      rooms === value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card hover:bg-secondary",
                    )}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </Section>

          <Section title="Comodidades">
            <Chips items={AMEN} selected={amen} onToggle={(value) => toggle(amen, value, setAmen)} />
          </Section>
        </div>

        <div className="flex gap-2 border-t border-border bg-background/95 p-4 safe-bottom">
          <Button
            variant="outline"
            className="h-11 flex-1 rounded-2xl"
            onClick={() => {
              setBudget([300000, 1500000]);
              setRooms(2);
              setTypes(["Apartamento"]);
              setNbhd([]);
              setAmen([]);
            }}
          >
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
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
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const active = selected.includes(item);
        return (
          <button
            key={item}
            type="button"
            onClick={() => onToggle(item)}
            className={cn(
              "rounded-full border px-3.5 py-2 text-sm transition",
              active
                ? "border-primary bg-primary/10 text-primary"
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
