import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/shared/components/Button";
import { ChipGroup } from "@/shared/components/ChipGroup";
import { Input } from "@/shared/components/Field";
import { AMENITIES, AMENITY_LABEL, PROPERTY_TYPES, PROPERTY_TYPE_LABEL, type Amenity, type PropertyType } from "@/shared/constants/enums";
import { getApiErrorMessage } from "@/shared/api/httpClient";
import type { CreatePreferencePayload } from "@/shared/types/domain";
import { formatCurrency, formatNumber } from "@/shared/utils/format";
import { generateMatches } from "@/modules/matches/api/matchesApi";
import { createPreference } from "../api/preferencesApi";

const steps = ["Localização", "Orçamento", "Imóvel", "Comodidades", "Resumo"] as const;

type PreferenceFormState = {
  title: string;
  city: string;
  state: string;
  neighborhoodsText: string;
  minPrice: string;
  maxPrice: string;
  minAreaM2: string;
  maxAreaM2: string;
  minBedrooms: string;
  minBathrooms: string;
  minParkingSpots: string;
  propertyTypes: PropertyType[];
  desiredAmenities: Amenity[];
};

const initialState: PreferenceFormState = {
  title: "",
  city: "",
  state: "",
  neighborhoodsText: "",
  minPrice: "",
  maxPrice: "",
  minAreaM2: "",
  maxAreaM2: "",
  minBedrooms: "",
  minBathrooms: "",
  minParkingSpots: "",
  propertyTypes: [],
  desiredAmenities: [],
};

export function PreferenceWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<PreferenceFormState>(initialState);
  const [loading, setLoading] = useState(false);

  const propertyOptions = PROPERTY_TYPES.map((type) => ({ value: type, label: PROPERTY_TYPE_LABEL[type] }));
  const amenityOptions = AMENITIES.map((amenity) => ({ value: amenity, label: AMENITY_LABEL[amenity] }));

  function update<K extends keyof PreferenceFormState>(key: K, value: PreferenceFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function next() {
    const error = validateStep(step, form);

    if (error) {
      toast.error(error);
      return;
    }

    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  function back() {
    setStep((current) => Math.max(current - 1, 0));
  }

  async function submit() {
    const error = validateAll(form);

    if (error) {
      toast.error(error);
      return;
    }

    const payload = toPayload(form);

    try {
      setLoading(true);
      const preference = await createPreference(payload);
      await generateMatches({ preferenceId: preference.id, minScore: 70 });
      toast.success("Preferência salva. Geramos seus imóveis compatíveis.");
      navigate("/matches", { replace: true });
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[2rem] border border-border bg-card p-5 shadow-card sm:p-8">
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {steps.map((label, index) => (
            <div
              key={label}
              className={`rounded-full px-3 py-1 text-xs font-bold ${index <= step ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
            >
              {index + 1}. {label}
            </div>
          ))}
        </div>
      </div>

      {step === 0 ? (
        <div className="grid gap-5">
          <Input label="Nome dessa preferência" value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="Ex.: Minha busca principal" />
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Cidade" value={form.city} onChange={(event) => update("city", event.target.value)} placeholder="Ex.: Recife" required />
            <Input label="Estado" value={form.state} onChange={(event) => update("state", event.target.value.toUpperCase())} placeholder="Ex.: PE" maxLength={2} required />
          </div>
          <Input
            label="Bairros desejados"
            hint="Separe por vírgula. Exemplo: Boa Viagem, Pina, Casa Forte"
            placeholder="Ex.: Boa Viagem, Pina, Casa Forte"
            value={form.neighborhoodsText}
            onChange={(event) => update("neighborhoodsText", event.target.value)}
            required
          />
        </div>
      ) : null}

      {step === 1 ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Preço mínimo" type="number" value={form.minPrice} onChange={(event) => update("minPrice", event.target.value)} placeholder="Ex.: 300000" />
          <Input label="Preço máximo" type="number" value={form.maxPrice} onChange={(event) => update("maxPrice", event.target.value)} placeholder="Ex.: 500000" />
          <Input label="Área mínima em m²" type="number" value={form.minAreaM2} onChange={(event) => update("minAreaM2", event.target.value)} placeholder="Ex.: 60" />
          <Input label="Área máxima em m²" type="number" value={form.maxAreaM2} onChange={(event) => update("maxAreaM2", event.target.value)} placeholder="Ex.: 100" />
        </div>
      ) : null}

      {step === 2 ? (
        <div className="grid gap-6">
          <ChipGroup label="Tipos de imóvel" options={propertyOptions} value={form.propertyTypes} onChange={(value) => update("propertyTypes", value)} />
          <div className="grid gap-5 sm:grid-cols-3">
            <Input label="Quartos mínimos" type="number" value={form.minBedrooms} onChange={(event) => update("minBedrooms", event.target.value)} placeholder="Ex.: 2" />
            <Input label="Banheiros mínimos" type="number" value={form.minBathrooms} onChange={(event) => update("minBathrooms", event.target.value)} placeholder="Ex.: 1" />
            <Input label="Vagas mínimas" type="number" value={form.minParkingSpots} onChange={(event) => update("minParkingSpots", event.target.value)} placeholder="Ex.: 1" />
          </div>
        </div>
      ) : null}

      {step === 3 ? <ChipGroup label="Comodidades desejadas" options={amenityOptions} value={form.desiredAmenities} onChange={(value) => update("desiredAmenities", value)} /> : null}

      {step === 4 ? <PreferenceSummary form={form} /> : null}

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button type="button" variant="secondary" onClick={back} disabled={step === 0 || loading}>
          <ArrowLeft className="size-4" />
          Voltar
        </Button>
        {step < steps.length - 1 ? (
          <Button type="button" onClick={next}>
            Continuar
            <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button type="button" onClick={submit} loading={loading}>
            <CheckCircle2 className="size-4" />
            Salvar e gerar matches
          </Button>
        )}
      </div>
    </div>
  );
}

function PreferenceSummary({ form }: { form: PreferenceFormState }) {
  const payload = toPayload(form);

  return (
    <div className="grid gap-5">
      <div>
        <h2 className="text-2xl font-extrabold text-foreground">Confirme sua busca</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Vamos salvar sua preferência e buscar imóveis compatíveis automaticamente.</p>
      </div>
      <div className="grid gap-3 rounded-3xl border border-border bg-secondary/40 p-5 text-sm">
        <SummaryLine label="Local" value={`${payload.city}/${payload.state} · ${payload.neighborhoods.join(", ")}`} />
        <SummaryLine label="Orçamento" value={`${formatCurrency(payload.minPrice)} até ${formatCurrency(payload.maxPrice)}`} />
        <SummaryLine label="Área" value={`${formatNumber(payload.minAreaM2, " m²")} até ${formatNumber(payload.maxAreaM2, " m²")}`} />
        <SummaryLine label="Tipo" value={payload.propertyTypes.map((type) => PROPERTY_TYPE_LABEL[type]).join(", ")} />
        <SummaryLine label="Características" value={`${payload.minBedrooms ?? 0}+ quartos · ${payload.minBathrooms ?? 0}+ banheiros · ${payload.minParkingSpots ?? 0}+ vagas`} />
        <SummaryLine label="Comodidades" value={payload.desiredAmenities.map((amenity) => AMENITY_LABEL[amenity]).join(", ") || "Sem preferência"} />
      </div>
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[140px_1fr]">
      <span className="font-bold text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}

function toPayload(form: PreferenceFormState): CreatePreferencePayload {
  return {
    title: form.title.trim() || "Minha busca principal",
    city: form.city.trim(),
    state: form.state.trim().toUpperCase(),
    neighborhoods: form.neighborhoodsText.split(",").map((item) => item.trim()).filter(Boolean),
    minPrice: parseOptionalNumber(form.minPrice),
    maxPrice: parseOptionalNumber(form.maxPrice),
    minAreaM2: parseOptionalNumber(form.minAreaM2),
    maxAreaM2: parseOptionalNumber(form.maxAreaM2),
    minBedrooms: parseOptionalNumber(form.minBedrooms),
    minBathrooms: parseOptionalNumber(form.minBathrooms),
    minParkingSpots: parseOptionalNumber(form.minParkingSpots),
    propertyTypes: form.propertyTypes,
    desiredAmenities: form.desiredAmenities,
    isActive: true,
  };
}

function parseOptionalNumber(value: string) {
  if (!value.trim()) return null;
  return Number(value);
}

function validateStep(step: number, form: PreferenceFormState) {
  if (step === 0 && (!form.city.trim() || !form.state.trim() || !form.neighborhoodsText.trim())) return "Informe cidade, estado e pelo menos um bairro.";
  if (step === 1 && form.minPrice && form.maxPrice && Number(form.minPrice) > Number(form.maxPrice)) return "O preço mínimo não pode ser maior que o máximo.";
  if (step === 1 && form.minAreaM2 && form.maxAreaM2 && Number(form.minAreaM2) > Number(form.maxAreaM2)) return "A área mínima não pode ser maior que a máxima.";
  if (step === 2 && form.propertyTypes.length === 0) return "Selecione pelo menos um tipo de imóvel.";
  return null;
}

function validateAll(form: PreferenceFormState) {
  for (let currentStep = 0; currentStep <= 3; currentStep += 1) {
    const error = validateStep(currentStep, form);
    if (error) return error;
  }

  return null;
}
