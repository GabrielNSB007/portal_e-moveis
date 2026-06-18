
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  Heart,
  Loader2,
  Plus,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { fmtCurrency } from "@/mock/data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import api from "@/services/api";

export const Route = createFileRoute("/agent")({
  component: AgentDashboard,
});

type UserRole = "CLIENTE" | "VENDEDOR";
type OfferStatus = "ATIVA" | "PAUSADA" | "VENDIDA" | "EXPIRADA";
type PropertyType = "APARTAMENTO" | "CASA" | "STUDIO" | "COBERTURA" | "TERRENO";
type Amenity = "PISCINA" | "ACADEMIA" | "CHURRASQUEIRA" | "ELEVADOR" | "PORTARIA" | "MOBILIADO" | "PET_FRIENDLY" | "VARANDA" | "AREA_SERVICO";

type AuthProfile = { id: string; name: string; email: string; phone?: string | null; role: UserRole };
type OfferMedia = { id?: string; url: string; type: "FOTO" | "VIDEO" };
type Offer = {
  id: string;
  title: string;
  description?: string | null;
  price: string | number;
  areaM2: number;
  bedrooms: number;
  bathrooms: number;
  parkingSpots: number;
  propertyType: PropertyType;
  status: OfferStatus;
  neighborhood: string;
  city: string;
  state: string;
  address?: string | null;
  amenities: Amenity[];
  media: OfferMedia[];
  createdAt: string;
  updatedAt: string;
};

type OffersResponse = { items: Offer[]; pagination: { page: number; limit: number; total: number; totalPages: number } };
type OfferForm = {
  title: string;
  description: string;
  price: string;
  areaM2: string;
  bedrooms: string;
  bathrooms: string;
  parkingSpots: string;
  propertyType: PropertyType;
  neighborhood: string;
  city: string;
  state: string;
  address: string;
  imageUrl: string;
  amenities: Amenity[];
};

const defaultForm: OfferForm = {
  title: "",
  description: "",
  price: "",
  areaM2: "",
  bedrooms: "1",
  bathrooms: "1",
  parkingSpots: "0",
  propertyType: "APARTAMENTO",
  neighborhood: "",
  city: "São Paulo",
  state: "SP",
  address: "",
  imageUrl: "",
  amenities: [],
};

const propertyTypeLabels: Record<PropertyType, string> = {
  APARTAMENTO: "Apartamento",
  CASA: "Casa",
  STUDIO: "Studio",
  COBERTURA: "Cobertura",
  TERRENO: "Terreno",
};

const amenityLabels: Record<Amenity, string> = {
  PISCINA: "Piscina",
  ACADEMIA: "Academia",
  CHURRASQUEIRA: "Churrasqueira",
  ELEVADOR: "Elevador",
  PORTARIA: "Portaria",
  MOBILIADO: "Mobiliado",
  PET_FRIENDLY: "Pet friendly",
  VARANDA: "Varanda",
  AREA_SERVICO: "Área de serviço",
};

const fallbackImages = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80",
];

const bars = [40, 65, 55, 80, 70, 92, 88];
const days = ["S", "T", "Q", "Q", "S", "S", "D"];
const inputClass = "h-11 w-full rounded-2xl border border-input bg-background px-3 text-sm font-bold outline-none focus-visible:ring-1 focus-visible:ring-ring";
function AgentDashboard() {
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<OfferForm>(defaultForm);
  const [isSaving, setIsSaving] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const isSeller = profile?.role === "VENDEDOR";

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const [{ data: profileData }, { data: offersData }] = await Promise.all([
        api.get<AuthProfile>("/auth/profile"),
        api.get<OffersResponse>("/offers/mine?limit=50"),
      ]);
      setProfile(profileData);
      setOffers(offersData.items ?? []);
    } catch (error: any) {
      toast.error(error?.response?.data?.error ?? "Não foi possível carregar o painel do anunciante.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const metrics = useMemo(() => {
    const active = offers.filter((offer) => offer.status === "ATIVA").length;
    const views = offers.reduce((sum, _offer, index) => sum + 120 + index * 37, 0);
    const interests = offers.reduce((sum, _offer, index) => sum + 4 + index * 2, 0);
    const matches = offers.reduce((sum, _offer, index) => sum + 2 + index, 0);
    const visits = Math.max(0, Math.floor(interests / 3));
    return { active, views, interests, matches, visits };
  }, [offers]);

  const stats = [
    { icon: Eye, label: "Visualizações", value: compactNumber(metrics.views), trend: "+12%", color: "text-primary", bg: "bg-primary/10" },
    { icon: Heart, label: "Interesses", value: metrics.interests, trend: "+8%", color: "text-destructive", bg: "bg-destructive/10" },
    { icon: Sparkles, label: "Matches", value: metrics.matches, trend: "+24%", color: "text-success", bg: "bg-success/10" },
    { icon: Users, label: "Visitas", value: metrics.visits, trend: "+3", color: "text-warning", bg: "bg-warning/10" },
  ];

  const activateSeller = async () => {
    setIsActivating(true);
    try {
      const { data } = await api.put<AuthProfile>("/auth/profile", { userRole: "VENDEDOR" });
      setProfile(data);
      toast.success("Área do anunciante ativada.");
    } catch (error: any) {
      toast.error(error?.response?.data?.error ?? "Não foi possível ativar a área do anunciante.");
    } finally {
      setIsActivating(false);
    }
  };

  const openCreateForm = () => {
    if (!isSeller) {
      toast.info("Ative a área do anunciante antes de cadastrar imóveis.");
      return;
    }
    setForm(defaultForm);
    setIsFormOpen(true);
  };

  const saveOffer = async () => {
    const payload = buildOfferPayload(form);
    if (!payload.title || !payload.price || !payload.areaM2 || !payload.neighborhood || !payload.city || !payload.state) {
      toast.error("Preencha título, preço, área, bairro, cidade e estado.");
      return;
    }
    setIsSaving(true);
    try {
      await api.post("/offers", payload);
      toast.success("Imóvel cadastrado.");
      setIsFormOpen(false);
      await loadDashboard();
    } catch (error: any) {
      toast.error(error?.response?.data?.error ?? "Não foi possível salvar o imóvel.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto min-h-screen pb-24 lg:max-w-[1200px] lg:px-8 lg:py-8 lg:pb-12">
      <header className="safe-top sticky top-0 z-20 flex items-center gap-3 border-b border-border/60 bg-background/95 px-5 py-4 backdrop-blur-xl lg:static lg:mb-8 lg:rounded-[2rem] lg:border lg:border-border/50 lg:bg-card lg:p-8 lg:shadow-sm">
        <Link to="/profile" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary text-foreground transition-colors hover:bg-black/10 dark:hover:bg-white/10 lg:h-12 lg:w-12">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1 lg:ml-2">
          <h1 className="truncate text-xl font-bold tracking-tight lg:text-3xl">Área do Anunciante</h1>
          <p className="truncate text-xs font-medium text-muted-foreground lg:mt-1 lg:text-sm">
            {profile?.name ?? "Carregando perfil"} · <span className="font-bold text-primary">Portal E-móveis</span>
          </p>
        </div>
        <Button className="hidden h-12 items-center gap-2 rounded-2xl bg-gradient-primary px-6 font-bold shadow-soft transition-transform hover:scale-105 active:scale-95 lg:flex lg:text-base" onClick={openCreateForm}>
          <Plus className="h-5 w-5" />
          Cadastrar Imóvel
        </Button>
        <Button size="icon" className="h-10 w-10 shrink-0 rounded-full bg-gradient-primary lg:hidden" onClick={openCreateForm}>
          <Plus className="h-5 w-5" />
        </Button>
      </header>

      <div className="space-y-6 p-5 lg:space-y-8 lg:p-0">
        <ActivationCard isSeller={isSeller} isLoading={isActivating} onActivate={activateSeller} />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
          {stats.map((stat) => (
            <div key={stat.label} className="group rounded-[1.5rem] border border-transparent bg-card p-4 shadow-soft transition-colors hover:border-border lg:rounded-[2rem] lg:p-6 lg:shadow-md">
              <div className="flex items-start justify-between">
                <div className={`grid h-10 w-10 place-items-center rounded-xl ${stat.bg} lg:h-12 lg:w-12 lg:rounded-2xl`}>
                  <stat.icon className={`h-5 w-5 ${stat.color} lg:h-6 lg:w-6`} />
                </div>
                <span className="inline-flex rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success lg:px-2.5 lg:py-1 lg:text-xs">{stat.trend}</span>
              </div>
              <div className="mt-4 text-2xl font-bold lg:mt-5 lg:text-4xl">{stat.value}</div>
              <div className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground lg:text-xs">{stat.label}</div>
            </div>
          ))}
        </div>
        <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-8 xl:grid-cols-[1fr_420px]">
          <WeeklyPerformance />
          <div className="mt-6 space-y-6 lg:mt-0 lg:space-y-8">
            <InsightCard />
            <QuickRegisterCard onClick={openCreateForm} disabled={!isSeller} />
          </div>
        </div>

        <ListingsSection offers={offers} activeCount={metrics.active} isLoading={isLoading} onCreate={openCreateForm} />
      </div>

      <OfferModal
        open={isFormOpen}
        form={form}
        isSaving={isSaving}
        onChange={(patch) => setForm((current) => ({ ...current, ...patch }))}
        onClose={() => setIsFormOpen(false)}
        onSave={saveOffer}
      />
    </div>
  );
}

function ActivationCard({ isSeller, isLoading, onActivate }: { isSeller: boolean; isLoading: boolean; onActivate: () => void }) {
  const steps = [
    { label: "Perfil", done: true },
    { label: "Contato", done: true },
    { label: "Anunciante", done: isSeller },
  ];

  return (
    <div className="rounded-[1.5rem] border border-primary/25 bg-primary/5 p-4 shadow-sm lg:rounded-[2rem] lg:p-6">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-sm font-bold text-primary lg:text-base">
            Cadastro de anunciante
            <BadgeCheck className="h-4 w-4" />
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground lg:text-sm">
            {isSeller ? "Sua área de anúncios está ativa. Os imóveis criados aqui já ficam vinculados ao seu usuário." : "Ative a área do anunciante para cadastrar imóveis sem misturar com sua busca de comprador."}
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {steps.map((step) => (
              <div key={step.label} className={cn("rounded-2xl px-2 py-2 text-center text-[10px] font-bold lg:text-xs", step.done ? "bg-success/15 text-success" : "bg-card text-muted-foreground")}>
                {step.done ? <CheckCircle2 className="mx-auto mb-1 h-4 w-4" /> : <Clock className="mx-auto mb-1 h-4 w-4" />}
                {step.label}
              </div>
            ))}
          </div>
        </div>
      </div>
      {!isSeller && (
        <Button variant="outline" className="mt-4 h-11 w-full rounded-2xl bg-card font-bold" onClick={onActivate} disabled={isLoading}>
          {isLoading ? "Ativando..." : "Ativar cadastro de anunciante"}
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

function WeeklyPerformance() {
  return (
    <div className="rounded-[1.5rem] border border-border/50 bg-card p-5 shadow-sm lg:rounded-[2rem] lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold lg:text-lg">Desempenho semanal</h3>
          <p className="text-xs font-medium text-muted-foreground lg:text-sm">Volume de interesses recebidos</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-xs font-bold text-success lg:text-sm">
          <TrendingUp className="h-4 w-4" />
          +24%
        </span>
      </div>
      <div className="mt-8 flex h-36 items-end gap-2 lg:h-56 lg:gap-4 xl:gap-6">
        {bars.map((height, index) => (
          <div key={`${days[index]}-${index}`} className="group flex flex-1 flex-col items-center gap-2 lg:gap-3">
            <div className="relative w-full flex-1 rounded-t-xl bg-secondary/50 lg:rounded-t-2xl">
              <div className="absolute bottom-0 w-full rounded-t-xl bg-gradient-primary lg:rounded-t-2xl" style={{ height: `${height}%` }} />
            </div>
            <span className="text-[10px] font-bold uppercase text-muted-foreground lg:text-xs">{days[index]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function InsightCard() {
  return (
    <div className="rounded-[1.5rem] border border-primary/30 bg-primary/5 p-5 shadow-sm lg:rounded-[2rem] lg:p-6">
      <div className="flex items-center gap-2 text-sm font-bold text-primary lg:text-base">
        <Sparkles className="h-5 w-5" />
        Insight do algoritmo
      </div>
      <p className="mt-3 text-sm leading-relaxed text-foreground/80 lg:text-base">
        Imóveis com <strong className="text-foreground">fotos externas e descrição objetiva</strong> recebem mais matches qualificados. Priorize fachada, planta e diferenciais do condomínio.
      </p>
    </div>
  );
}

function QuickRegisterCard({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} className="hidden w-full flex-col items-center justify-center gap-3 rounded-[2rem] border-2 border-dashed border-border bg-secondary/20 p-8 transition-colors hover:border-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60 lg:flex">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-card shadow-sm">
        <Building2 className="h-6 w-6 text-primary" />
      </div>
      <div className="text-center">
        <div className="font-bold text-foreground">Cadastrar novo imóvel</div>
        <div className="mt-1 text-xs text-muted-foreground">Adicione fotos e detalhes para o matchmaking.</div>
      </div>
    </button>
  );
}
function ListingsSection({ offers, activeCount, isLoading, onCreate }: { offers: Offer[]; activeCount: number; isLoading: boolean; onCreate: () => void }) {
  return (
    <section className="pt-2 lg:pt-6">
      <div className="mb-4 flex items-center justify-between px-1 lg:mb-6 lg:px-2">
        <h3 className="text-base font-bold lg:text-xl">Meus imóveis</h3>
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-muted-foreground lg:text-sm">{activeCount} ativos</span>
      </div>
      {isLoading && (
        <div className="grid place-items-center rounded-[1.5rem] border border-border bg-card p-10 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}
      {!isLoading && offers.length === 0 && (
        <button type="button" onClick={onCreate} className="grid w-full place-items-center rounded-[1.5rem] border-2 border-dashed border-border bg-card p-10 text-center transition-colors hover:border-primary hover:bg-primary/5">
          <Building2 className="h-8 w-8 text-primary" />
          <span className="mt-3 text-sm font-bold">Nenhum imóvel cadastrado ainda</span>
          <span className="mt-1 text-xs text-muted-foreground">Crie o primeiro anúncio para validar a integração com o banco.</span>
        </button>
      )}
      <div className="grid gap-3 lg:grid-cols-2 lg:gap-5">
        {offers.map((offer, index) => (
          <OfferCard key={offer.id} offer={offer} image={offer.media?.[0]?.url || fallbackImages[index % fallbackImages.length]} interests={4 + index * 2} />
        ))}
      </div>
    </section>
  );
}

function OfferCard({ offer, image, interests }: { offer: Offer; image: string; interests: number }) {
  return (
    <div className="group flex items-center gap-4 rounded-[1.5rem] border border-border/50 bg-card p-3 shadow-sm transition-all hover:border-border hover:shadow-md lg:p-4">
      <div className="relative shrink-0 overflow-hidden rounded-xl lg:h-24 lg:w-24 lg:rounded-2xl">
        <img src={image} alt="" className="h-16 w-16 object-cover transition-transform duration-500 group-hover:scale-110 lg:h-full lg:w-full" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold lg:text-base">{offer.title}</div>
        <div className="mt-0.5 text-[11px] font-medium text-muted-foreground lg:mt-1 lg:text-xs">{offer.neighborhood} · {offer.city}/{offer.state}</div>
        <div className="mt-1 text-sm font-bold text-foreground lg:mt-2 lg:text-lg">{fmtCurrency(Number(offer.price))}</div>
      </div>
      <div className="flex flex-col items-end justify-between self-stretch py-1">
        <StatusPill status={offer.status} />
        <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground lg:text-sm">
          <Heart className="h-3 w-3 lg:h-4 lg:w-4" />
          {interests}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: OfferStatus }) {
  const active = status === "ATIVA";
  const label = status === "ATIVA" ? "Ativo" : status === "PAUSADA" ? "Pausado" : status === "VENDIDA" ? "Vendido" : "Expirado";
  return (
    <div className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider lg:px-3 lg:py-1.5", active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground")}>
      {active && <span className="h-1.5 w-1.5 rounded-full bg-success" />}
      {label}
    </div>
  );
}

function OfferModal({ open, form, isSaving, onChange, onClose, onSave }: { open: boolean; form: OfferForm; isSaving: boolean; onChange: (patch: Partial<OfferForm>) => void; onClose: () => void; onSave: () => void }) {
  if (!open) return null;
  const toggleAmenity = (amenity: Amenity) => {
    onChange({ amenities: form.amenities.includes(amenity) ? form.amenities.filter((item) => item !== amenity) : [...form.amenities, amenity] });
  };
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/45 p-4 backdrop-blur-sm">
      <div className="mx-auto my-6 w-full max-w-3xl rounded-3xl border border-border bg-card p-5 shadow-card lg:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold">Cadastrar imóvel</h3>
            <p className="mt-1 text-sm text-muted-foreground">Esses dados já são enviados para a API de ofertas.</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-sm font-bold">x</button>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <Field label="Título" className="lg:col-span-2"><input value={form.title} onChange={(event) => onChange({ title: event.target.value })} className={inputClass} placeholder="Cobertura com vista livre" /></Field>
          <Field label="Descrição" className="lg:col-span-2"><textarea value={form.description} onChange={(event) => onChange({ description: event.target.value })} className={`${inputClass} min-h-24 py-3`} placeholder="Detalhes que ajudam comprador, locatário ou investidor" /></Field>
          <Field label="Preço"><input value={form.price} onChange={(event) => onChange({ price: onlyDigits(event.target.value) })} className={inputClass} inputMode="numeric" placeholder="1280000" /></Field>
          <Field label="Área útil"><input value={form.areaM2} onChange={(event) => onChange({ areaM2: onlyDigits(event.target.value) })} className={inputClass} inputMode="numeric" placeholder="142" /></Field>
          <Field label="Tipo"><select value={form.propertyType} onChange={(event) => onChange({ propertyType: event.target.value as PropertyType })} className={inputClass}>{Object.entries(propertyTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
          <Field label="Quartos"><input value={form.bedrooms} onChange={(event) => onChange({ bedrooms: onlyDigits(event.target.value) })} className={inputClass} inputMode="numeric" /></Field>
          <Field label="Banheiros"><input value={form.bathrooms} onChange={(event) => onChange({ bathrooms: onlyDigits(event.target.value) })} className={inputClass} inputMode="numeric" /></Field>
          <Field label="Vagas"><input value={form.parkingSpots} onChange={(event) => onChange({ parkingSpots: onlyDigits(event.target.value) })} className={inputClass} inputMode="numeric" /></Field>
          <Field label="Bairro"><input value={form.neighborhood} onChange={(event) => onChange({ neighborhood: event.target.value })} className={inputClass} placeholder="Vila Madalena" /></Field>
          <Field label="Cidade"><input value={form.city} onChange={(event) => onChange({ city: event.target.value })} className={inputClass} /></Field>
          <Field label="Estado"><input value={form.state} onChange={(event) => onChange({ state: event.target.value.toUpperCase().slice(0, 2) })} className={inputClass} placeholder="SP" /></Field>
          <Field label="Endereço" className="lg:col-span-2"><input value={form.address} onChange={(event) => onChange({ address: event.target.value })} className={inputClass} placeholder="Rua, número e complemento" /></Field>
          <Field label="URL da foto principal" className="lg:col-span-2"><input value={form.imageUrl} onChange={(event) => onChange({ imageUrl: event.target.value })} className={inputClass} placeholder="https://..." /></Field>
        </div>
        <div className="mt-5">
          <div className="mb-2 text-xs font-bold text-muted-foreground">Comodidades</div>
          <div className="flex flex-wrap gap-2">{(Object.keys(amenityLabels) as Amenity[]).map((amenity) => <button key={amenity} type="button" onClick={() => toggleAmenity(amenity)} className={cn("rounded-full border px-3 py-2 text-xs font-bold transition-colors", form.amenities.includes(amenity) ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:border-primary/50")}>{amenityLabels[amenity]}</button>)}</div>
        </div>
        <div className="mt-6 flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving} className="h-11 flex-1 rounded-2xl">Cancelar</Button>
          <Button type="button" onClick={onSave} disabled={isSaving} className="h-11 flex-1 rounded-2xl bg-gradient-primary font-bold">{isSaving ? "Salvando..." : "Cadastrar imóvel"}</Button>
        </div>
      </div>
    </div>
  );
}
function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return <label className={cn("block", className)}><span className="mb-2 block text-xs font-bold text-muted-foreground">{label}</span>{children}</label>;
}

function buildOfferPayload(form: OfferForm) {
  return {
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    price: Number(form.price),
    areaM2: Number(form.areaM2),
    bedrooms: Number(form.bedrooms),
    bathrooms: Number(form.bathrooms),
    parkingSpots: Number(form.parkingSpots),
    propertyType: form.propertyType,
    status: "ATIVA" as const,
    neighborhood: form.neighborhood.trim(),
    city: form.city.trim(),
    state: form.state.trim().toUpperCase(),
    address: form.address.trim() || undefined,
    amenities: form.amenities,
    media: form.imageUrl.trim() ? [{ url: form.imageUrl.trim(), type: "FOTO" as const }] : [],
  };
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function compactNumber(value: number) {
  if (value >= 1000) return `${(value / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}k`;
  return value.toString();
}
