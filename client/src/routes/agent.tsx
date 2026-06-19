
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
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { fmtCurrency } from "@/mock/data";
import { cn } from "@/lib/utils";
import { citiesForState, DEFAULT_CITY, DEFAULT_STATE, neighborhoodsForCity, STATE_OPTIONS } from "@/lib/location-options";
import { toast } from "sonner";
import api from "@/services/api";
import { listMatches, type BackendMatch } from "@/services/matches";
import type { BackendProposal } from "@/lib/offer-mappers";
import { getSellerAnalyticsSummary, type SellerAnalyticsSummary } from "@/services/analytics";

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
  imageFileName: string;
  amenities: Amenity[];
};

const defaultCity = DEFAULT_CITY;
const defaultNeighborhood = neighborhoodsForCity(defaultCity)[0] ?? "";

const defaultForm: OfferForm = {
  title: "",
  description: "",
  price: "",
  areaM2: "",
  bedrooms: "1",
  bathrooms: "1",
  parkingSpots: "0",
  propertyType: "APARTAMENTO",
  neighborhood: defaultNeighborhood,
  city: defaultCity,
  state: DEFAULT_STATE,
  address: "",
  imageUrl: "",
  imageFileName: "",
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
  AREA_SERVICO: "Area de servico",
};

const fallbackImages = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80",
];

const inputClass = "h-11 w-full rounded-2xl border border-input bg-background px-3 text-sm font-bold outline-none focus-visible:ring-1 focus-visible:ring-ring";
function AgentDashboard() {
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [receivedProposals, setReceivedProposals] = useState<BackendProposal[]>([]);
  const [compatibleMatches, setCompatibleMatches] = useState<BackendMatch[]>([]);
  const [matchCount, setMatchCount] = useState(0);
  const [analytics, setAnalytics] = useState<SellerAnalyticsSummary>({ totalViews: 0, totalVisits: 0, byOffer: {} });
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [form, setForm] = useState<OfferForm>(defaultForm);
  const [isSaving, setIsSaving] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [sellerRequestSent, setSellerRequestSent] = useState(() => localStorage.getItem("emoveis-seller-request") === "review");
  const [sellerAccessUnlocked, setSellerAccessUnlocked] = useState(() => localStorage.getItem("emoveis-seller-access") === "approved");

  const canManageListings = profile?.role === "VENDEDOR" || sellerAccessUnlocked;

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const [{ data: profileData }, { data: offersData }, { data: proposalsData }, matchesResponse, { data: analyticsData }] = await Promise.all([
        api.get<AuthProfile>("/auth/profile"),
        api.get<OffersResponse>("/offers/mine?limit=50"),
        api.get<BackendProposal[]>("/proposals/received"),
        listMatches(),
        getSellerAnalyticsSummary(),
      ]);
      const ownedOffers = offersData.items ?? [];
      const ownedOfferIds = new Set(ownedOffers.map((offer) => offer.id));
      const sellerMatches = dedupeMatchesByOfferAndUser(
        (matchesResponse.data.items ?? []).filter((match) => ownedOfferIds.has(match.offerId)),
      );

      setProfile(profileData);
      setOffers(ownedOffers);
      setReceivedProposals(proposalsData ?? []);
      setCompatibleMatches(sellerMatches);
      setMatchCount(sellerMatches.length);
      setAnalytics(analyticsData);
    } catch (error: any) {
      toast.error(error?.response?.data?.error ?? "Nao foi possivel carregar o painel do anunciante.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const metrics = useMemo(() => {
    const active = offers.filter((offer) => offer.status === "ATIVA").length;
    const views = analytics.totalViews;
    const interests = receivedProposals.length;
    const matches = matchCount;
    const visits = analytics.totalVisits;
    return { active, views, interests, matches, visits };
  }, [analytics.totalViews, analytics.totalVisits, matchCount, offers, receivedProposals.length]);

  const proposalCountByOffer = useMemo(() => {
    return receivedProposals.reduce<Record<string, number>>((acc, proposal) => {
      acc[proposal.offerId] = (acc[proposal.offerId] ?? 0) + 1;
      return acc;
    }, {});
  }, [receivedProposals]);

  const stats = [
    { icon: Eye, label: "Visualizacoes", value: compactNumber(metrics.views), trend: "+12%", color: "text-primary", bg: "bg-primary/10" },
    { icon: Heart, label: "Interesses", value: metrics.interests, trend: "+8%", color: "text-destructive", bg: "bg-destructive/10" },
    { icon: Sparkles, label: "Matches", value: metrics.matches, trend: "+24%", color: "text-success", bg: "bg-success/10" },
    { icon: Users, label: "Visitas", value: metrics.visits, trend: "+3", color: "text-warning", bg: "bg-warning/10" },
  ];

  const activateSeller = async () => {
    setIsActivating(true);
    localStorage.setItem("emoveis-seller-request", "review");
    setSellerRequestSent(true);
    toast.loading("Validando identidade, contato e seguranca do anunciante...", { id: "seller-validation" });

    window.setTimeout(() => {
      localStorage.setItem("emoveis-seller-access", "approved");
      setSellerAccessUnlocked(true);
      setIsActivating(false);
      toast.success("Analise concluida. Painel de anunciante liberado.", { id: "seller-validation" });
    }, 1200);
  };
  const openCreateForm = () => {
    if (!canManageListings) {
      toast.info("Ative a area do anunciante antes de cadastrar imoveis.");
      return;
    }
    setForm(defaultForm);
    setIsFormOpen(true);
  };

  const saveOffer = async () => {
    const payload = buildOfferPayload(form);
    if (!payload.title || !payload.price || !payload.areaM2 || !payload.neighborhood || !payload.city || !payload.state) {
      toast.error("Preencha titulo, preco, area, bairro, cidade e estado.");
      return;
    }
    setIsSaving(true);
    try {
      await api.post("/offers", payload);
      toast.success("Imovel cadastrado.");
      setIsFormOpen(false);
      await loadDashboard();
    } catch (error: any) {
      toast.error(error?.response?.data?.error ?? "Nao foi possivel salvar o imovel.");
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
          <h1 className="truncate text-xl font-bold tracking-tight lg:text-3xl">Area do Anunciante</h1>
          <p className="truncate text-xs font-medium text-muted-foreground lg:mt-1 lg:text-sm">
            {profile?.name ?? "Carregando perfil"} - <span className="font-bold text-primary">Portal E-moveis</span>
          </p>
        </div>
        <Button className="hidden h-12 items-center gap-2 rounded-2xl bg-gradient-primary px-6 font-bold shadow-soft transition-transform hover:scale-105 active:scale-95 lg:flex lg:text-base" onClick={openCreateForm}>
          <Plus className="h-5 w-5" />
          Cadastrar Imovel
        </Button>
        <Button size="icon" className="h-10 w-10 shrink-0 rounded-full bg-gradient-primary lg:hidden" onClick={openCreateForm}>
          <Plus className="h-5 w-5" />
        </Button>
      </header>

      <div className="space-y-6 p-5 lg:space-y-8 lg:p-0">
        <ActivationCard isSeller={canManageListings} requestSent={sellerRequestSent} isLoading={isActivating} onActivate={activateSeller} />

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
          <SellerActivitySummary metrics={metrics} offers={offers} />
          <div className="mt-6 space-y-6 lg:mt-0 lg:space-y-8">
            <SellerHelpCard hasOffers={offers.length > 0} hasInterests={metrics.interests > 0} />
            <QuickRegisterCard onClick={openCreateForm} disabled={!canManageListings} />
          </div>
        </div>

        <ReceivedInterestsSection proposals={receivedProposals} offers={offers} onOpenOffer={setSelectedOffer} />
        <CompatibleProfilesSection matches={compatibleMatches} offers={offers} onOpenOffer={setSelectedOffer} />
        <ListingsSection offers={offers} activeCount={metrics.active} isLoading={isLoading} proposalCountByOffer={proposalCountByOffer} analyticsByOffer={analytics.byOffer} onCreate={openCreateForm} onOpenOffer={setSelectedOffer} />
      </div>

      <SellerOfferDetailModal
        offer={selectedOffer}
        matches={compatibleMatches.filter((match) => match.offerId === selectedOffer?.id)}
        proposals={receivedProposals.filter((proposal) => proposal.offerId === selectedOffer?.id)}
        views={selectedOffer ? analytics.byOffer[selectedOffer.id]?.views ?? 0 : 0}
        visits={selectedOffer ? analytics.byOffer[selectedOffer.id]?.visits ?? 0 : 0}
        onClose={() => setSelectedOffer(null)}
      />

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

function ActivationCard({ isSeller, requestSent, isLoading, onActivate }: { isSeller: boolean; requestSent: boolean; isLoading: boolean; onActivate: () => void }) {
  const steps = [
    { label: "Perfil", done: true },
    { label: "Contato", done: true },
    { label: "Documentos", done: isSeller || requestSent },
    { label: "Analise", done: isSeller },
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
            {isSeller ? "Sua area de anuncios esta ativa. Os imoveis criados aqui ficam vinculados ao seu usuario." : requestSent ? "Estamos simulando a validacao de identidade, contato e seguranca para esta demonstracao." : "Solicite a area do anunciante para cadastrar imoveis sem misturar com sua busca de comprador."}
          </p>
          <div className="mt-4 grid grid-cols-4 gap-2">
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
        <Button variant="outline" className="mt-4 h-11 w-full rounded-2xl bg-card font-bold" onClick={onActivate} disabled={isLoading || requestSent}>
          {isLoading ? "Validando..." : requestSent ? "Continuar validacao" : "Validar e liberar painel"}
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

function SellerActivitySummary({ metrics, offers }: { metrics: { active: number; views: number; interests: number; matches: number; visits: number }; offers: Offer[] }) {
  const topOffer = offers
    .filter((offer) => offer.status === "ATIVA")
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())[0];

  const rows = [
    { label: "An\u00fancios ativos", value: metrics.active, detail: metrics.active ? "vis\u00edveis na busca" : "cadastre seu primeiro im\u00f3vel" },
    { label: "Interesses recebidos", value: metrics.interests, detail: metrics.interests ? "aguardando sua resposta" : "ainda sem contatos" },
    { label: "Perfis compat\u00edveis", value: metrics.matches, detail: metrics.matches ? "calculados pelo matchmaking" : "aparecem ap\u00f3s gerar matches" },
    { label: "Visitas registradas", value: metrics.visits, detail: metrics.visits ? "vindas dos seus an\u00fancios" : "sem visitas por enquanto" },
  ];

  return (
    <div className="rounded-[1.5rem] border border-border/50 bg-card p-5 shadow-sm lg:rounded-[2rem] lg:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-bold lg:text-lg">Resumo dos an&uacute;ncios</h3>
          <p className="mt-1 text-xs font-medium text-muted-foreground lg:text-sm">
            Acompanhe o que j&aacute; aconteceu com seus im&oacute;veis publicados.
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">Atual</span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label} className="rounded-2xl border border-border bg-background p-4">
            <div className="text-2xl font-bold text-foreground">{row.value}</div>
            <div className="mt-1 text-xs font-bold text-foreground">{row.label}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">{row.detail}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl bg-secondary/50 p-4 text-sm leading-relaxed text-muted-foreground">
        {topOffer ? (
          <>
            Seu an&uacute;ncio mais recente &eacute; <strong className="text-foreground">{topOffer.title}</strong>. Quando algu&eacute;m demonstrar interesse, a conversa aparece em "Interesses recebidos" e o contato s&oacute; fica claro depois do match ou da proposta aceita.
          </>
        ) : (
          "Cadastre um im\u00f3vel para come\u00e7ar. Depois disso, o painel mostra interesses recebidos, compradores compat\u00edveis e visitas registradas."
        )}
      </div>
    </div>
  );
}

function SellerHelpCard({ hasOffers, hasInterests }: { hasOffers: boolean; hasInterests: boolean }) {
  const message = !hasOffers
    ? "Comece cadastrando um im\u00f3vel com pre\u00e7o, localiza\u00e7\u00e3o e fotos. O sistema usa esses dados para aproximar compradores com perfil compat\u00edvel."
    : hasInterests
      ? "Voc\u00ea j\u00e1 tem interessados. Abra cada an\u00fancio para ver quem entrou em contato, acompanhar o status e liberar contato quando fizer sentido."
      : "Seus an\u00fancios j\u00e1 podem aparecer para compradores compat\u00edveis. Interesses e matches aparecem aqui conforme as pessoas interagem com os im\u00f3veis.";

  return (
    <div className="rounded-[1.5rem] border border-primary/30 bg-primary/5 p-5 shadow-sm lg:rounded-[2rem] lg:p-6">
      <div className="flex items-center gap-2 text-sm font-bold text-primary lg:text-base">
        <Sparkles className="h-5 w-5" />
        Como este painel funciona
      </div>
      <p className="mt-3 text-sm leading-relaxed text-foreground/80 lg:text-base">{message}</p>
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
        <div className="font-bold text-foreground">Cadastrar novo imovel</div>
        <div className="mt-1 text-xs text-muted-foreground">Adicione fotos e detalhes para o matchmaking.</div>
      </div>
    </button>
  );
}
function ReceivedInterestsSection({ proposals, offers, onOpenOffer }: { proposals: BackendProposal[]; offers: Offer[]; onOpenOffer: (offer: Offer) => void }) {
  const byOffer = new Map(offers.map((offer) => [offer.id, offer]));
  const latest = proposals.slice(0, 5);

  return (
    <section className="rounded-[1.5rem] border border-border/50 bg-card p-5 shadow-sm lg:rounded-[2rem] lg:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-bold lg:text-xl">Interesses recebidos</h3>
          <p className="mt-1 text-xs text-muted-foreground lg:text-sm">
            Propostas e contatos iniciados pelos compradores nos seus anuncios.
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{proposals.length} recebidos</span>
      </div>

      {latest.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-border bg-background p-5 text-sm text-muted-foreground">
          Quando compradores enviarem interesse nos seus imoveis, eles aparecem aqui para voce acompanhar sem misturar com sua busca de comprador.
        </div>
      ) : (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {latest.map((proposal) => {
            const offer = byOffer.get(proposal.offerId);
            const offerTitle = offer?.title ?? proposal.offer?.title ?? "Anuncio";
            return (
              <button
                key={proposal.id}
                type="button"
                onClick={() => offer && onOpenOffer(offer)}
                className="rounded-2xl border border-border bg-background p-4 text-left transition-colors hover:border-primary/50 hover:bg-primary/5 disabled:cursor-default"
                disabled={!offer}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold">{proposal.buyer?.name ?? "Comprador compativel"}</div>
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">{offerTitle}</div>
                  </div>
                  <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-bold text-muted-foreground">{proposal.status}</span>
                </div>
                {proposal.message && <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{proposal.message}</p>}
                <div className="mt-3 text-[11px] font-bold text-primary">Abrir gestao do anuncio</div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
function CompatibleProfilesSection({ matches, offers, onOpenOffer }: { matches: BackendMatch[]; offers: Offer[]; onOpenOffer: (offer: Offer) => void }) {
  const byOffer = new Map(offers.map((offer) => [offer.id, offer]));
  const topMatches = matches.slice(0, 6);

  return (
    <section className="rounded-[1.5rem] border border-border/50 bg-card p-5 shadow-sm lg:rounded-[2rem] lg:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-bold lg:text-xl">Perfis compativeis</h3>
          <p className="mt-1 text-xs text-muted-foreground lg:text-sm">
            Compradores com preferencias proximas dos seus anuncios.
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{matches.length} perfis</span>
      </div>

      {topMatches.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-border bg-background p-5 text-sm text-muted-foreground">
          Gere matches a partir dos seus anuncios para visualizar compradores aderentes ao perfil do imovel.
        </div>
      ) : (
        <div className="mt-4 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {topMatches.map((match) => {
            const offer = byOffer.get(match.offerId);
            const buyer = match.preference?.user;
            return (
              <button
                key={match.id}
                type="button"
                onClick={() => offer && onOpenOffer(offer)}
                className="rounded-2xl border border-border bg-background p-4 text-left transition-colors hover:border-primary/50 hover:bg-primary/5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold">{buyer?.name ?? "Comprador compativel"}</div>
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">{offer?.title ?? match.offer.title}</div>
                  </div>
                  <span className="shrink-0 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">{Math.round(match.score)}%</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold text-muted-foreground">
                  <span className="rounded-full bg-secondary px-2 py-1">{match.status}</span>
                  <span className="rounded-full bg-secondary px-2 py-1">{match.offer.city}/{match.offer.state}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
function ListingsSection({ offers, activeCount, isLoading, proposalCountByOffer, analyticsByOffer, onCreate, onOpenOffer }: { offers: Offer[]; activeCount: number; isLoading: boolean; proposalCountByOffer: Record<string, number>; analyticsByOffer: SellerAnalyticsSummary["byOffer"]; onCreate: () => void; onOpenOffer: (offer: Offer) => void }) {
  return (
    <section className="pt-2 lg:pt-6">
      <div className="mb-4 flex items-center justify-between px-1 lg:mb-6 lg:px-2">
        <h3 className="text-base font-bold lg:text-xl">Meus imoveis</h3>
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
          <span className="mt-3 text-sm font-bold">Nenhum imovel cadastrado ainda</span>
          <span className="mt-1 text-xs text-muted-foreground">Crie o primeiro anuncio para validar a integracao com o banco.</span>
        </button>
      )}
      <div className="grid gap-3 lg:grid-cols-2 lg:gap-5">
        {offers.map((offer, index) => (
          <OfferCard key={offer.id} offer={offer} image={offer.media?.[0]?.url || fallbackImages[index % fallbackImages.length]} interests={proposalCountByOffer[offer.id] ?? 0} views={analyticsByOffer[offer.id]?.views ?? 0} onOpen={() => onOpenOffer(offer)} />
        ))}
      </div>
    </section>
  );
}

function OfferCard({ offer, image, interests, views, onOpen }: { offer: Offer; image: string; interests: number; views: number; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} className="group flex w-full items-center gap-4 rounded-[1.5rem] border border-border/50 bg-card p-3 text-left shadow-sm transition-all hover:border-border hover:shadow-md lg:p-4">
      <div className="relative shrink-0 overflow-hidden rounded-xl lg:h-24 lg:w-24 lg:rounded-2xl">
        <img src={image} alt="" className="h-16 w-16 object-cover transition-transform duration-500 group-hover:scale-110 lg:h-full lg:w-full" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold lg:text-base">{offer.title}</div>
        <div className="mt-0.5 text-[11px] font-medium text-muted-foreground lg:mt-1 lg:text-xs">{offer.neighborhood} - {offer.city}/{offer.state}</div>
        <div className="mt-1 text-sm font-bold text-foreground lg:mt-2 lg:text-lg">{fmtCurrency(Number(offer.price))}</div>
      </div>
      <div className="flex flex-col items-end justify-between self-stretch py-1">
        <StatusPill status={offer.status} />
        <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground lg:text-sm">
          <span className="inline-flex items-center gap-1">
            <Eye className="h-3 w-3 lg:h-4 lg:w-4" />
            {views}
          </span>
          <span className="inline-flex items-center gap-1">
            <Heart className="h-3 w-3 lg:h-4 lg:w-4" />
            {interests}
          </span>
        </div>
      </div>
    </button>
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

function SellerOfferDetailModal({ offer, matches, proposals, views, visits, onClose }: { offer: Offer | null; matches: BackendMatch[]; proposals: BackendProposal[]; views: number; visits: number; onClose: () => void }) {
  if (!offer) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/45 p-4 backdrop-blur-sm">
      <div className="mx-auto my-6 w-full max-w-4xl rounded-3xl border border-border bg-card p-5 shadow-card lg:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Gestao do anuncio</div>
            <h3 className="mt-1 text-xl font-bold lg:text-2xl">{offer.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{offer.neighborhood} - {offer.city}/{offer.state}</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-sm font-bold">x</button>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="overflow-hidden rounded-2xl border border-border bg-background">
            <img src={offer.media?.[0]?.url || fallbackImages[0]} alt="" className="h-48 w-full object-cover" />
            <div className="space-y-2 p-4">
              <div className="text-2xl font-bold">{fmtCurrency(Number(offer.price))}</div>
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
                <span className="rounded-full bg-secondary px-2 py-1">{offer.bedrooms} quartos</span>
                <span className="rounded-full bg-secondary px-2 py-1">{offer.bathrooms} banheiros</span>
                <span className="rounded-full bg-secondary px-2 py-1">{offer.areaM2}m2</span>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="grid grid-cols-3 gap-3">
              <MetricMini label="Visualizacoes" value={views} />
              <MetricMini label="Visitas" value={visits} />
              <MetricMini label="Perfis" value={matches.length} />
            </div>

            <div className="rounded-2xl border border-border bg-background p-4">
              <h4 className="text-sm font-bold">Compradores compativeis</h4>
              <div className="mt-3 space-y-2">
                {matches.length ? matches.map((match) => {
                  const buyer = match.preference?.user;
                  const contactReleased = match.status === "FEITO";
                  return (
                    <div key={match.id} className="rounded-xl bg-card px-3 py-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-bold">{buyer?.name ?? "Comprador compativel"}</div>
                          <div className="text-xs text-muted-foreground">{contactReleased ? "Contato liberado" : match.status}</div>
                        </div>
                        <span className="rounded-full bg-primary px-2 py-1 text-xs font-bold text-primary-foreground">{Math.round(match.score)}%</span>
                      </div>
                      {contactReleased && (
                        <div className="mt-2 grid gap-1 text-xs font-medium text-muted-foreground">
                          <span>{buyer?.phone ?? "Telefone nao informado"}</span>
                          <span>{buyer?.email ?? "Email nao informado"}</span>
                        </div>
                      )}
                    </div>
                  );
                }) : <p className="text-sm text-muted-foreground">Nenhum perfil compativel gerado para este anuncio ainda.</p>}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background p-4">
              <h4 className="text-sm font-bold">Propostas recebidas</h4>
              <div className="mt-3 space-y-2">
                {proposals.length ? proposals.map((proposal) => (
                  <div key={proposal.id} className="rounded-xl bg-card px-3 py-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate text-sm font-bold">{proposal.buyer?.name ?? "Comprador compativel"}</span>
                      <span className="rounded-full bg-secondary px-2 py-1 text-[11px] font-bold text-muted-foreground">{proposal.status}</span>
                    </div>
                    {proposal.message && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{proposal.message}</p>}
                    {proposal.status === "ACEITA" && (
                      <div className="mt-2 grid gap-1 rounded-xl bg-success/10 p-2 text-xs font-medium text-success">
                        <span>Contato liberado</span>
                        <span>{proposal.buyer?.phone ?? "Telefone nao informado"}</span>
                        <span>{proposal.buyer?.email ?? "Email nao informado"}</span>
                      </div>
                    )}
                  </div>
                )) : <p className="text-sm text-muted-foreground">Nenhuma proposta recebida para este anuncio.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricMini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-3">
      <div className="text-xl font-bold">{value}</div>
      <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
function OfferModal({ open, form, isSaving, onChange, onClose, onSave }: { open: boolean; form: OfferForm; isSaving: boolean; onChange: (patch: Partial<OfferForm>) => void; onClose: () => void; onSave: () => void }) {
  if (!open) return null;
  const cityOptions = citiesForState(form.state);
  const neighborhoodOptions = neighborhoodsForCity(form.city);
  const toggleAmenity = (amenity: Amenity) => {
    onChange({ amenities: form.amenities.includes(amenity) ? form.amenities.filter((item) => item !== amenity) : [...form.amenities, amenity] });
  };
  const changeState = (state: string) => {
    const nextCity = citiesForState(state)[0] ?? "";
    onChange({ state, city: nextCity, neighborhood: neighborhoodsForCity(nextCity)[0] ?? "" });
  };
  const changeCity = (city: string) => {
    onChange({ city, neighborhood: neighborhoodsForCity(city)[0] ?? "" });
  };
  const handleImageFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Envie uma imagem PNG, JPG ou WebP.");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      toast.error("Essa imagem esta muito grande. Escolha uma foto de ate 12MB.");
      return;
    }

    try {
      const imageUrl = await compressImageToDataUrl(file);
      onChange({ imageUrl, imageFileName: file.name });
    } catch {
      toast.error("Nao foi possivel processar essa imagem.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/45 p-4 backdrop-blur-sm">
      <div className="mx-auto my-6 w-full max-w-3xl rounded-3xl border border-border bg-card p-5 shadow-card lg:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold">Cadastrar imovel</h3>
            <p className="mt-1 text-sm text-muted-foreground">Esses dados ja sao enviados para a API de ofertas.</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-sm font-bold">x</button>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <Field label="Titulo" className="lg:col-span-2"><input value={form.title} onChange={(event) => onChange({ title: event.target.value })} className={inputClass} placeholder="Cobertura com vista livre" /></Field>
          <Field label="Descricao" className="lg:col-span-2"><textarea value={form.description} onChange={(event) => onChange({ description: event.target.value })} className={`${inputClass} min-h-24 py-3`} placeholder="Detalhes que ajudam comprador, locatario ou investidor" /></Field>
          <Field label="Preco"><input value={form.price} onChange={(event) => onChange({ price: onlyDigits(event.target.value) })} className={inputClass} inputMode="numeric" placeholder="1280000" /></Field>
          <Field label="Area util"><input value={form.areaM2} onChange={(event) => onChange({ areaM2: onlyDigits(event.target.value) })} className={inputClass} inputMode="numeric" placeholder="142" /></Field>
          <Field label="Tipo"><select value={form.propertyType} onChange={(event) => onChange({ propertyType: event.target.value as PropertyType })} className={inputClass}>{Object.entries(propertyTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
          <Field label="Quartos"><input value={form.bedrooms} onChange={(event) => onChange({ bedrooms: onlyDigits(event.target.value) })} className={inputClass} inputMode="numeric" /></Field>
          <Field label="Banheiros"><input value={form.bathrooms} onChange={(event) => onChange({ bathrooms: onlyDigits(event.target.value) })} className={inputClass} inputMode="numeric" /></Field>
          <Field label="Vagas"><input value={form.parkingSpots} onChange={(event) => onChange({ parkingSpots: onlyDigits(event.target.value) })} className={inputClass} inputMode="numeric" /></Field>
          <Field label="Estado"><select value={form.state} onChange={(event) => changeState(event.target.value)} className={inputClass}>{STATE_OPTIONS.map((state) => <option key={state.value} value={state.value}>{state.label}</option>)}</select></Field>
          <Field label="Cidade"><select value={form.city} onChange={(event) => changeCity(event.target.value)} className={inputClass}>{cityOptions.map((city) => <option key={city} value={city}>{city}</option>)}</select></Field>
          <Field label="Bairro"><select value={form.neighborhood} onChange={(event) => onChange({ neighborhood: event.target.value })} className={inputClass}>{neighborhoodOptions.map((neighborhood) => <option key={neighborhood} value={neighborhood}>{neighborhood}</option>)}</select></Field>
          <Field label="Endereco" className="lg:col-span-2"><input value={form.address} onChange={(event) => onChange({ address: event.target.value })} className={inputClass} placeholder="Rua, numero e complemento" /></Field>
          <Field label="Foto principal" className="lg:col-span-2">
            <div className="space-y-3">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
                <input value={form.imageUrl} onChange={(event) => onChange({ imageUrl: event.target.value, imageFileName: "" })} className={inputClass} placeholder="https://... ou envie uma imagem" />
                <label className="inline-flex h-11 cursor-pointer items-center justify-center rounded-2xl border border-border bg-secondary px-4 text-sm font-bold transition-colors hover:border-primary/50">
                  Enviar PNG/JPG
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={handleImageFile} />
                </label>
              </div>
              {form.imageFileName && <div className="text-xs font-semibold text-muted-foreground">Arquivo selecionado: {form.imageFileName}</div>}
              {form.imageUrl && <img src={form.imageUrl} alt="Previa do imovel" className="h-40 w-full rounded-2xl border border-border object-cover" />}
            </div>
          </Field>
        </div>
        <div className="mt-5">
          <div className="mb-2 text-xs font-bold text-muted-foreground">Comodidades</div>
          <div className="flex flex-wrap gap-2">{(Object.keys(amenityLabels) as Amenity[]).map((amenity) => <button key={amenity} type="button" onClick={() => toggleAmenity(amenity)} className={cn("rounded-full border px-3 py-2 text-xs font-bold transition-colors", form.amenities.includes(amenity) ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:border-primary/50")}>{amenityLabels[amenity]}</button>)}</div>
        </div>
        <div className="mt-6 flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving} className="h-11 flex-1 rounded-2xl">Cancelar</Button>
          <Button type="button" onClick={onSave} disabled={isSaving} className="h-11 flex-1 rounded-2xl bg-gradient-primary font-bold">{isSaving ? "Salvando..." : "Cadastrar imovel"}</Button>
        </div>
      </div>
    </div>
  );
}
function compressImageToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Erro ao ler imagem"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("Imagem invalida"));
      image.onload = () => {
        const maxSide = 1400;
        const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Canvas indisponivel"));
          return;
        }
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
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

function dedupeMatchesByOfferAndUser(matches: BackendMatch[]) {
  const map = new Map<string, BackendMatch>();

  for (const match of matches) {
    const buyerId = match.preference?.user?.id ?? match.preference?.userId ?? match.preferenceId;
    const key = `${match.offerId}:${buyerId}`;
    const current = map.get(key);
    if (!current || match.score > current.score) map.set(key, match);
  }

  return Array.from(map.values()).sort((left, right) => right.score - left.score);
}








