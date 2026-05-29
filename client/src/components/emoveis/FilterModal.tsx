import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { fmtCurrency } from "@/mock/data";
import { useState } from "react";
import { cn } from "@/lib/utils";

const TYPES = ["Apartamento", "Casa", "Studio", "Cobertura", "Comercial"];
const NBHD = ["Vila Madalena", "Pinheiros", "Itaim Bibi", "Perdizes", "Vila Olímpia", "Alto de Pinheiros"];
const AMEN = ["Piscina", "Academia", "Pet friendly", "Segurança 24h", "Coworking", "Quintal"];

export function FilterModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [budget, setBudget] = useState([300000, 1500000]);
  const [rooms, setRooms] = useState(2);
  const [types, setTypes] = useState<string[]>(["Apartamento"]);
  const [nbhd, setNbhd] = useState<string[]>([]);
  const [amen, setAmen] = useState<string[]>([]);

  const tog = (arr: string[], v: string, set: (s: string[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Filtros</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <Section title="Orçamento">
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
            <Chips items={NBHD} selected={nbhd} onToggle={(v) => tog(nbhd, v, setNbhd)} />
          </Section>

          <Section title="Tipo">
            <Chips items={TYPES} selected={types} onToggle={(v) => tog(types, v, setTypes)} />
          </Section>

          <Section title="Quartos">
            <div className="flex gap-2">
              {[1, 2, 3, "4+"].map((n) => (
                <button
                  key={n}
                  onClick={() => setRooms(Number(String(n).replace("+", "")))}
                  className={cn(
                    "h-10 flex-1 rounded-xl border text-sm font-medium transition",
                    rooms === Number(String(n).replace("+", ""))
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card hover:bg-secondary"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Comodidades">
            <Chips items={AMEN} selected={amen} onToggle={(v) => tog(amen, v, setAmen)} />
          </Section>
        </div>

        <div className="sticky bottom-0 -mx-6 -mb-6 flex gap-2 border-t border-border bg-background/95 p-4 backdrop-blur">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Limpar
          </Button>
          <Button className="flex-1 bg-gradient-primary" onClick={() => onOpenChange(false)}>
            Aplicar filtros
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold">{title}</h4>
      {children}
    </div>
  );
}

function Chips({
  items,
  selected,
  onToggle,
}: {
  items: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => {
        const active = selected.includes(it);
        return (
          <button
            key={it}
            onClick={() => onToggle(it)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm transition",
              active
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-foreground hover:bg-secondary"
            )}
          >
            {it}
          </button>
        );
      })}
    </div>
  );
}
