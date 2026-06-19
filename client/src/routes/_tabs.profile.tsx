import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Bath,
  BedDouble,
  Bell,
  Car,
  Check,
  Coins,
  CreditCard,
  Eye,
  Home,
  LogOut,
  Mail,
  MapPin,
  Moon,
  PawPrint,
  Pencil,
  Phone,
  Send,
  Shield,
  ShieldCheck,
  Sparkles,
  Sun,
  TrainFront,
} from "lucide-react";
import { fmtCurrency, properties, SEARCH_STYLES, user, type Property } from "@/mock/data";
import { PropertyCard } from "@/components/emoveis/PropertyCard";
import { SectionHeader } from "@/components/emoveis/SectionHeader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/hooks/use-theme";
import { clearAuthToken, clearLegacyOnboardingFlag, clearSessionEmail, setSessionEmail } from "@/lib/auth-session";
import api from "@/services/api";
import { mapOffersToProperties } from "@/lib/offer-mappers";
import { listSavedOffers } from "@/services/saved-offers";
import { listMatches } from "@/services/matches";
import { findManyPreferences } from "@/services/preferences";
import type { ReadDeletePreference } from "@/types/preferences";
import type { BackendProposal } from "@/lib/offer-mappers";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_tabs/profile")({
  component: Profile,
});

type AuthProfile = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: "CLIENTE" | "VENDEDOR";
  createdAt: string;
  updatedAt: string;
};

type ProfileDetailsResponse = {
  avatarUrl?: string | null;
  income?: string | number | null;
  downPayment?: string | number | null;
  needsFinancing?: boolean | null;
  purchaseType?: string | null;
  documentId?: string | null;
  documentStatus?: "PENDING" | "REVIEW" | "VERIFIED" | "REJECTED";
  verifiedAt?: string | null;
};

type ProfileExtras = {
  avatar?: string;
  income?: number;
  downPayment?: number;
  needsFinancing?: boolean;
  purchaseType?: string;
  documentId?: string;
  documentStatus?: string;
  identityVerified?: boolean;
};

type ProfileSection = "photo" | "finance" | "verification" | null;

type ProfileDraft = {
  name: string;
  email: string;
  phone: string;
  password: string;
  currentPassword: string;
};

const extrasKey = (email: string) => `emoveis-profile-extras:${email.toLowerCase()}`;


const detailsToExtras = (details?: ProfileDetailsResponse | null): ProfileExtras => ({
  avatar: details?.avatarUrl ?? undefined,
  income: details?.income === null || details?.income === undefined ? undefined : Number(details.income),
  downPayment: details?.downPayment === null || details?.downPayment === undefined ? undefined : Number(details.downPayment),
  needsFinancing: details?.needsFinancing ?? undefined,
  purchaseType: details?.purchaseType ?? undefined,
  documentId: details?.documentId ?? undefined,
  documentStatus: details?.documentStatus === "REVIEW" ? "review" : details?.documentStatus === "VERIFIED" ? "verified" : details?.documentStatus === "REJECTED" ? "rejected" : undefined,
  identityVerified: details?.documentStatus === "VERIFIED",
});

const extrasToDetails = (extras: ProfileExtras) => ({
  avatarUrl: extras.avatar ?? null,
  income: extras.income ?? null,
  downPayment: extras.downPayment ?? null,
  needsFinancing: extras.needsFinancing ?? null,
  purchaseType: extras.purchaseType ?? null,
  documentId: extras.documentId ?? null,
});

const loadProfileExtras = (email?: string | null): ProfileExtras => {
  if (!email) return {};

  try {
    return JSON.parse(localStorage.getItem(extrasKey(email)) ?? "{}") as ProfileExtras;
  } catch {
    return {};
  }
};

function Profile() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [searchStyle, setSearchStyle] = useState("soon");
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [extras, setExtras] = useState<ProfileExtras>({});
  const [activeSection, setActiveSection] = useState<ProfileSection>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isActivatingSeller, setIsActivatingSeller] = useState(false);
  const [sellerRequestSent, setSellerRequestSent] = useState(() => localStorage.getItem("emoveis-seller-request") === "review");
  const [profileDraft, setProfileDraft] = useState<ProfileDraft>({ name: "", email: "", phone: "", password: "", currentPassword: "" });
  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  const [savedFallback, setSavedFallback] = useState(false);
  const [profileStats, setProfileStats] = useState({ interests: 0, matches: 0, viewed: 0 });
  const [activePreference, setActivePreference] = useState<ReadDeletePreference | null>(null);

  useEffect(() => {
    let active = true;

    api
      .get<AuthProfile>("/auth/profile")
      .then(({ data }) => {
        if (active) setProfile(data);
      })
      .catch(() => {
        if (active) {
          toast.error("Não foi possível carregar seu perfil.");
          navigate({ to: "/auth" });
        }
      })
      .finally(() => {
        if (active) setIsProfileLoading(false);
      });

    return () => {
      active = false;
    };
  }, [navigate]);



  useEffect(() => {
    let active = true;

    Promise.all([
      api.get<BackendProposal[]>("/proposals"),
      listMatches(),
    ])
      .then(([proposalsResponse, matchesResponse]) => {
        if (!active) return;
        setProfileStats({
          interests: proposalsResponse.data.length,
          matches: matchesResponse.data.pagination?.total ?? matchesResponse.data.items.length,
          viewed: 0,
        });
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);


  useEffect(() => {
    let active = true;

    findManyPreferences()
      .then((preferences) => {
        if (!active) return;
        setActivePreference(preferences.find((preference) => preference.isActive) ?? preferences[0] ?? null);
      })
      .catch(() => {
        if (active) setActivePreference(null);
      });

    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    let active = true;

    listSavedOffers()
      .then(({ data }) => {
        if (active) {
          setSavedFallback(false);
          setSavedProperties(mapOffersToProperties(data.map((item) => item.offer)));
        }
      })
      .catch(() => {
        if (active) {
          setSavedFallback(true);
          setSavedProperties([]);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (profile?.email && !extras.documentStatus && !extras.avatar && !extras.income) {
      setExtras(loadProfileExtras(profile.email));
    }
  }, [profile?.email]);

  const saveExtras = async (next: ProfileExtras) => {
    if (!profile?.email) return;

    const updated = activeSection === "verification"
      ? { ...extras, ...next, identityVerified: false, documentStatus: next.documentId ? "review" : "pending" }
      : { ...extras, ...next };

    try {
      const { data } = await api.put<ProfileDetailsResponse>("/auth/profile/details", extrasToDetails(updated));
      const synced = detailsToExtras(data);
      setExtras(synced);
      localStorage.setItem(extrasKey(profile.email), JSON.stringify(synced));
      toast.success("Perfil atualizado.");
      setActiveSection(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.error ?? "Não foi possível salvar os detalhes do perfil.");
    }
  };

  const displayName = profile?.name ?? (isProfileLoading ? "Carregando..." : user.name);
  const displayEmail = profile?.email ?? user.email;
  const displayPhone = profile?.phone || "Não informado";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "EU";
  const hasIncome = typeof extras.income === "number" && extras.income > 0;
  const hasFinanceGoal = typeof extras.needsFinancing === "boolean" || Boolean(extras.purchaseType);
  const incomeLabel = hasIncome ? fmtCurrency(extras.income!) : "Não informado";
  const objectiveLabel = hasFinanceGoal ? (extras.needsFinancing ? "Compra financiada" : "Aluguel ou investimento") : "Não informado";
  const securityLabel = extras.identityVerified ? "Verificado" : extras.documentStatus === "review" ? "Em análise" : "Pendente";
  const completion = Math.min(
    100,
    35 + (extras.avatar ? 20 : 0) + (hasIncome ? 20 : 0) + (hasFinanceGoal ? 10 : 0) + (extras.documentStatus ? 15 : 0),
  );
  const preferenceCards = buildPreferenceCards(activePreference);
  const isSeller = profile?.role === "VENDEDOR";

  const openProfileEditor = () => {
    setProfileDraft({
      name: profile?.name ?? "",
      email: profile?.email ?? "",
      phone: profile?.phone ?? "",
      password: "",
      currentPassword: "",
    });
    setIsEditOpen(true);
  };

  const saveProfileBasics = async () => {
    const name = profileDraft.name.trim();
    const email = profileDraft.email.trim().toLowerCase();
    const phone = profileDraft.phone.trim();

    if (!name || !email) {
      toast.error("Nome e email são obrigatórios.");
      return;
    }

    setIsSavingProfile(true);
    try {
      const previousEmail = profile?.email;
      const payload: { name: string; email: string; phone?: string; password?: string; currentPassword?: string } = { name, email };

      if (phone) payload.phone = phone;
      if (profileDraft.password.trim()) {
        if (!profileDraft.currentPassword.trim()) {
          toast.error("Digite sua senha atual para criar uma nova senha.");
          setIsSavingProfile(false);
          return;
        }
        payload.password = profileDraft.password.trim();
        payload.currentPassword = profileDraft.currentPassword.trim();
      }

      const { data } = await api.put<AuthProfile>("/auth/profile", payload);
      setProfile(data);
      setSessionEmail(data.email);

      if (previousEmail && previousEmail.toLowerCase() !== data.email.toLowerCase()) {
        const oldExtras = loadProfileExtras(previousEmail);
        localStorage.setItem(extrasKey(data.email), JSON.stringify({ ...oldExtras, ...extras }));
      }

      toast.success("Dados do perfil atualizados.");
      setIsEditOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.error ?? "Não foi possível atualizar o perfil.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const activateSellerPanel = async () => {
    if (isSeller) {
      navigate({ to: "/agent" });
      return;
    }

    setIsActivatingSeller(true);
    try {
      localStorage.setItem("emoveis-seller-request", "review");
      setSellerRequestSent(true);
      toast.success("Solicitação enviada para análise. Vamos validar seus dados antes de liberar anúncios.");
    } finally {
      setIsActivatingSeller(false);
    }
  };
  const stats = [
    { icon: Send, label: "Interesses", value: profileStats.interests },
    { icon: Sparkles, label: "Matches", value: profileStats.matches },
    { icon: Eye, label: "Vistos", value: profileStats.viewed },
  ];

  const logout = () => {
    clearAuthToken();
    clearSessionEmail();
    clearLegacyOnboardingFlag();
    toast.success("Até logo!");
    navigate({ to: "/auth" });
  };

  return (
    <div className="mx-auto pb-20 lg:max-w-[1200px] lg:px-8 lg:py-8 lg:pb-8">
      
      {/* HEADER / HERO SECTION */}
      <div className="relative bg-gradient-hero px-5 pb-20 pt-6 safe-top lg:rounded-[2.5rem] lg:border lg:border-border/50 lg:p-10 lg:pb-24 lg:shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary lg:text-xs">
              Seu Perfil
            </h1>
            <p className="mt-1 hidden text-sm text-muted-foreground lg:block">
              Gerencie suas preferências e dados de matchmaking.
            </p>
          </div>
          <button type="button" onClick={openProfileEditor} className="grid h-10 w-10 place-items-center rounded-2xl bg-card shadow-soft transition-transform hover:scale-105 lg:h-12 lg:w-12">
            <Pencil className="h-4 w-4 lg:h-5 lg:w-5" />
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between lg:mt-8">
          <div className="flex min-w-0 items-center gap-4 lg:gap-6">
            {extras.avatar ? (
              <img
                src={extras.avatar}
                className="h-20 w-20 shrink-0 rounded-3xl border-4 border-background object-cover shadow-card lg:h-28 lg:w-28 lg:rounded-[2rem]"
                alt={displayName}
              />
            ) : (
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl border-4 border-background bg-gradient-primary text-2xl font-bold text-primary-foreground shadow-card lg:h-28 lg:w-28 lg:rounded-[2rem] lg:text-3xl" aria-label={displayName}>
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="truncate text-2xl font-bold tracking-tight lg:text-4xl">{displayName}</h2>
              <p className="truncate text-sm text-muted-foreground lg:mt-1 lg:text-base">{displayEmail}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-success lg:mt-3 lg:text-xs">
                <ShieldCheck className="h-3 w-3 lg:h-4 lg:w-4" /> {extras.identityVerified ? "Perfil verificado" : extras.documentStatus === "review" ? "Documento em análise" : "Perfil básico"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:w-[340px] lg:gap-4">
            {stats.map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl bg-card/90 p-3 text-center shadow-soft backdrop-blur transition-transform hover:-translate-y-1 lg:p-4">
                <Icon className="mx-auto h-5 w-5 text-primary lg:h-6 lg:w-6" />
                <div className="mt-2 text-xl font-bold lg:text-2xl">{value}</div>
                <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground lg:text-xs">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* COMPLETENESS CARD (Sobreposto) */}
      <div className="relative z-10 -mt-12 px-5 lg:-mt-14 lg:px-10">
        <div className="mx-auto rounded-3xl border border-primary/35 bg-gradient-to-br from-primary/15 via-card to-card p-5 shadow-xl ring-1 ring-primary/10 lg:p-6">
          <div className="flex items-center justify-between text-xs lg:text-sm">
            <span className="font-bold text-foreground">Completar perfil</span>
            <span className="font-bold text-primary">{completion}%</span>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-secondary lg:h-3">
            <div 
              className="h-full rounded-full bg-gradient-primary transition-all duration-1000 ease-out" 
              style={{ width: `${completion}%` }} 
            />
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground lg:text-xs">
            Complete apenas dados reais. Campos vazios ficam pendentes e não entram no matchmaking financeiro.
          </p>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="mt-8 grid gap-7 px-5 lg:mt-10 lg:grid-cols-[1fr_360px] lg:px-0 xl:grid-cols-[1fr_400px] xl:gap-8">
        
        {/* COLUNA ESQUERDA (Principal) */}
        <div className="space-y-8">
          <Section
            title="Critérios de Matchmaking"
            subtitle="O que buscamos para você"
            action={
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigate({ to: "/onboarding" })}
                className="h-9 rounded-2xl px-3 text-xs font-bold"
              >
                <Pencil className="h-3.5 w-3.5" />
                Editar
              </Button>
            }
          >
            {preferenceCards.length ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:gap-4">
                {preferenceCards.map((card) => <PrefCard key={card.label} icon={card.icon} label={card.label} value={card.value} />)}
              </div>
            ) : (
              <EmptyProfileState onClick={() => navigate({ to: "/onboarding" })} />
            )}
          </Section>

          <Section
            title="Dados do perfil"
            subtitle="Informações protegidas"
            action={
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openProfileEditor}
                className="h-9 rounded-2xl px-3 text-xs font-bold"
              >
                <Pencil className="h-3.5 w-3.5" />
                Editar
              </Button>
            }
          >
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:gap-4">
              <PrefCard icon={Pencil} label="Nome" value={displayName.split(" ")[0]} />
              <PrefCard icon={Mail} label="Email" value="Oculto" hint="Privado" />
              <PrefCard icon={Phone} label="Telefone" value={displayPhone} />
              <PrefCard icon={Coins} label="Renda" value={incomeLabel} hint="Opcional" />
              <PrefCard icon={CreditCard} label="Objetivo" value={objectiveLabel} />
              <PrefCard icon={Shield} label="Segurança" value={securityLabel} />
            </div>
          </Section>

          <Section
            title="Completar perfil"
            subtitle="Dados usados para deixar o matchmaking mais preciso"
            className="rounded-3xl border border-primary/25 bg-primary/5 p-5 shadow-soft"
          >
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <ProfileTask icon={Pencil} title="Foto do perfil" description={extras.avatar ? "Foto adicionada" : "Adicionar imagem real"} done={Boolean(extras.avatar)} onClick={() => setActiveSection("photo")} />
              <ProfileTask icon={Coins} title="Renda e objetivo" description={extras.income ? `${fmtCurrency(extras.income)} informados` : "Renda, objetivo e orçamento"} done={Boolean(extras.income)} onClick={() => setActiveSection("finance")} />
              <ProfileTask icon={Shield} title="Verificação" description={extras.documentStatus === "review" ? "Documento em análise" : extras.identityVerified ? "Dados verificados" : "Enviar documento para análise"} done={Boolean(extras.documentStatus)} onClick={() => setActiveSection("verification")} />
            </div>
          </Section>

          <Section title="Configurações do App">
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
              <Row icon={Bell} label="Notificações push" right={<Switch defaultChecked />} />
              <Row
                icon={theme === "dark" ? Moon : Sun}
                label="Modo noturno"
                right={
                  <Switch
                    checked={theme === "dark"}
                    onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                  />
                }
              />
              <Row icon={LogOut} label="Sair da conta" onClick={logout} destructive last />
            </div>
          </Section>

          {/* Imóveis Salvos Mobile (Oculto no Desktop) */}
          <div className="lg:hidden">
            <SavedProperties items={savedProperties} useFallback={savedFallback} />
          </div>
        </div>

        {/* COLUNA DIREITA (Sidebar Desktop) */}
        <aside className="space-y-6">
          <Section title="Estilo de busca" subtitle="Como o algoritmo trabalha">
            <div className="space-y-3">
              {SEARCH_STYLES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSearchStyle(s.id)}
                  className={cn(
                    "group flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all",
                    searchStyle === s.id
                      ? "border-primary bg-primary/5 shadow-soft"
                      : "border-border bg-card hover:border-primary/40 hover:shadow-sm"
                  )}
                >
                  <div className="min-w-0 pr-4">
                    <div className="text-sm font-bold text-foreground">{s.label}</div>
                    <div className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.desc}</div>
                  </div>
                  <div
                    className={cn(
                      "grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-all",
                      searchStyle === s.id ? "border-primary bg-primary" : "border-muted-foreground/30 group-hover:border-primary/50"
                    )}
                  >
                    {searchStyle === s.id && <Check className="h-3 w-3 text-white" />}
                  </div>
                </button>
              ))}
            </div>
          </Section>

          <SellerAccessCard
            isSeller={isSeller}
            isLoading={isActivatingSeller}
            requestSent={sellerRequestSent}
            onActivate={activateSellerPanel}
          />

          {/* Imóveis Salvos Desktop */}
          <div className="hidden lg:block">
            <SavedProperties items={savedProperties} useFallback={savedFallback} />
          </div>

        </aside>
      </div>

      <ProfileEditModal
        open={isEditOpen}
        draft={profileDraft}
        isSaving={isSavingProfile}
        onChange={(patch) => setProfileDraft((current) => ({ ...current, ...patch }))}
        onClose={() => setIsEditOpen(false)}
        onSave={saveProfileBasics}
      />

      <ProfileCompletionModal
        section={activeSection}
        extras={extras}
        onClose={() => setActiveSection(null)}
        onSave={saveExtras}
      />

      <p className="mt-8 text-center text-xs font-medium text-muted-foreground/50 lg:mt-10">
        Portal E-móveis · v1.0.0 · Matchmaking imobiliário inteligente
      </p>
    </div>
  );
}

function formatOptionalCurrency(value?: string | number | null) {
  if (value === undefined || value === null || value === "") return "Não informado";
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? fmtCurrency(numeric) : "Não informado";
}

function formatPropertyTypes(types?: string[]) {
  if (!types?.length) return "Não informado";
  const labels: Record<string, string> = {
    APARTAMENTO: "Apartamento",
    CASA: "Casa",
    STUDIO: "Studio",
    COBERTURA: "Cobertura",
    TERRENO: "Terreno",
  };
  return types.map((type) => labels[type] ?? type).join(", ");
}

function buildPreferenceCards(preference: ReadDeletePreference | null) {
  if (!preference) return [];

  return [
    { icon: Coins, label: "Faixa de preço", value: `${formatOptionalCurrency(preference.minPrice)} - ${formatOptionalCurrency(preference.maxPrice)}` },
    { icon: MapPin, label: "Cidade", value: preference.city && preference.state ? `${preference.city}/${preference.state}` : "Não informado" },
    { icon: BedDouble, label: "Quartos", value: preference.minBedrooms !== undefined ? `${preference.minBedrooms}+` : "Não informado" },
    { icon: Bath, label: "Banheiros", value: preference.minBathrooms !== undefined ? `${preference.minBathrooms}+` : "Não informado" },
    { icon: Home, label: "Tipo imóvel", value: formatPropertyTypes(preference.propertyTypes) },
    { icon: Car, label: "Garagem", value: preference.minParkingSpots !== undefined ? `${preference.minParkingSpots}+` : "Não informado" },
    { icon: PawPrint, label: "Comodidades", value: preference.desiredAmenities?.length ? preference.desiredAmenities.join(", ").replace(/_/g, " ") : "Não informado" },
    { icon: TrainFront, label: "Área útil", value: preference.minAreaM2 || preference.maxAreaM2 ? `${preference.minAreaM2 ?? 0}m² - ${preference.maxAreaM2 ?? "sem limite"}m²` : "Não informado" },
  ];
}

function EmptyProfileState({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="w-full rounded-3xl border border-dashed border-primary/40 bg-primary/5 p-5 text-left transition-colors hover:bg-primary/10">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary text-primary-foreground">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-bold text-foreground">Nenhum critério ativo encontrado</div>
          <div className="mt-1 text-xs text-muted-foreground">Refaça o onboarding para calibrar o Explorar e o matchmaking.</div>
        </div>
      </div>
    </button>
  );
}
function SavedProperties({ items, useFallback }: { items: Property[]; useFallback: boolean }) {
  const list = items.length ? items : useFallback ? properties.slice(0, 4) : [];

  return (
    <div>
      <SectionHeader title="Imoveis Salvos" subtitle={`${list.length} imoveis`} />
      {/* Carrossel no Mobile, Grid no Desktop */}
      {list.length ? (
        <div className="mt-3 flex gap-4 overflow-x-auto pb-2 no-scrollbar lg:grid lg:grid-cols-2 lg:overflow-visible lg:pb-0">
          {list.map((pr) => (
            <div key={pr.id} className="w-[240px] shrink-0 lg:w-auto">
              <PropertyCard property={pr} compact />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-3 rounded-3xl border border-border bg-card p-5 text-sm text-muted-foreground">
          Nenhum imovel salvo ainda.
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-bold tracking-tight text-foreground lg:text-xl">{title}</h2>
          {subtitle && <p className="mt-1 text-xs text-muted-foreground lg:text-sm">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </section>
  );
}

/* NOVO COMPONENTE: PrefCard substitui as linhas antigas */
function PrefCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: any;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col justify-center rounded-2xl border border-transparent bg-secondary/40 p-4 transition-colors hover:border-border lg:p-5">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 shrink-0 text-primary" />
        <span className="truncate text-[10px] font-bold uppercase tracking-wider text-muted-foreground lg:text-xs">
          {label}
        </span>
        {hint && (
          <span className="ml-auto shrink-0 rounded-full bg-background px-2 py-0.5 text-[9px] font-bold shadow-sm">
            {hint}
          </span>
        )}
      </div>
      <div className="mt-2 truncate text-sm font-bold text-foreground lg:text-base">{value}</div>
    </div>
  );
}

function ProfileTask({
  icon: Icon,
  title,
  description,
  done,
  onClick,
}: {
  icon: any;
  title: string;
  description: string;
  done?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition hover:border-primary/40 hover:bg-primary/5"
    >
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
          {title}
          {done && <Check className="h-3.5 w-3.5 text-success" />}
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </button>
  );
}

function SellerAccessCard({
  isSeller,
  isLoading,
  requestSent,
  onActivate,
}: {
  isSeller: boolean;
  isLoading: boolean;
  requestSent: boolean;
  onActivate: () => void;
}) {
  return (
    <Section title="Área do anunciante" subtitle={isSeller ? "Painel liberado para anúncios" : requestSent ? "Solicitação em análise" : "Solicite acesso para anunciar"}>
      <div className="rounded-3xl border border-primary/25 bg-primary/5 p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
            <Home className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-foreground">
              {isSeller ? "Seu painel está ativo" : requestSent ? "Análise em andamento" : "Solicitar área do anunciante"}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {isSeller
                ? "Gerencie seus imóveis sem misturar com sua busca de comprador."
                : requestSent
                  ? "Recebemos sua solicitação. A liberação deve acontecer após validação de dados e documentos."
                  : "Antes de anunciar, vamos validar seus dados e documentos para proteger compradores e proprietários."}
            </p>
          </div>
        </div>
        <Button
          type="button"
          onClick={onActivate}
          disabled={isLoading || (!isSeller && requestSent)}
          className="mt-4 h-11 w-full rounded-2xl bg-gradient-primary font-bold"
        >
          {isLoading ? "Aguarde..." : isSeller ? "Abrir painel" : requestSent ? "Em análise" : "Solicitar análise"}
        </Button>
      </div>
    </Section>
  );
}

function ProfileEditModal({
  open,
  draft,
  isSaving,
  onChange,
  onClose,
  onSave,
}: {
  open: boolean;
  draft: ProfileDraft;
  isSaving: boolean;
  onChange: (patch: Partial<ProfileDraft>) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold">Editar perfil</h3>
            <p className="mt-1 text-sm text-muted-foreground">Atualize os dados principais usados no login e no contato.</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-sm font-bold">
            x
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <FieldText label="Nome completo">
            <input
              value={draft.name}
              onChange={(event) => onChange({ name: event.target.value })}
              className="h-11 w-full rounded-2xl border border-input bg-background px-3 text-sm font-bold outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Seu nome"
            />
          </FieldText>
          <FieldText label="Email">
            <input
              value={draft.email}
              onChange={(event) => onChange({ email: event.target.value })}
              className="h-11 w-full rounded-2xl border border-input bg-background px-3 text-sm font-bold outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="voce@email.com"
              inputMode="email"
            />
          </FieldText>
          <FieldText label="Telefone">
            <input
              value={draft.phone}
              onChange={(event) => onChange({ phone: event.target.value })}
              className="h-11 w-full rounded-2xl border border-input bg-background px-3 text-sm font-bold outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="+55 11 99999-0000"
              inputMode="tel"
            />
          </FieldText>
          <FieldText label="Senha atual">
            <input
              value={draft.currentPassword}
              onChange={(event) => onChange({ currentPassword: event.target.value })}
              className="h-11 w-full rounded-2xl border border-input bg-background px-3 text-sm font-bold outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Obrigatória para trocar a senha"
              type="password"
            />
          </FieldText>
          <FieldText label="Nova senha">
            <input
              value={draft.password}
              onChange={(event) => onChange({ password: event.target.value })}
              className="h-11 w-full rounded-2xl border border-input bg-background px-3 text-sm font-bold outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Deixe em branco para manter"
              type="password"
            />
          </FieldText>
        </div>

        <div className="mt-6 flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="h-11 flex-1 rounded-2xl" disabled={isSaving}>
            Cancelar
          </Button>
          <Button type="button" onClick={onSave} className="h-11 flex-1 rounded-2xl bg-gradient-primary font-bold" disabled={isSaving}>
            {isSaving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ProfileCompletionModal({
  section,
  extras,
  onClose,
  onSave,
}: {
  section: ProfileSection;
  extras: ProfileExtras;
  onClose: () => void;
  onSave: (extras: ProfileExtras) => void;
}) {
  const [draft, setDraft] = useState<ProfileExtras>(extras);

  useEffect(() => {
    setDraft(extras);
  }, [extras, section]);

  if (!section) return null;

  const title =
    section === "photo"
      ? "Foto do perfil"
      : section === "finance"
        ? "Renda e objetivo"
        : "Enviar documento";

  const handleImage = (file?: File) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setDraft((current) => ({ ...current, avatar: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">Esses dados ficam no seu perfil e ajudam a calibrar recomendações.</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-sm font-bold">
            x
          </button>
        </div>

        {section === "photo" && (
          <div className="mt-5 space-y-4">
            <div className="grid place-items-center rounded-3xl border border-dashed border-border bg-secondary/40 p-6">
              {draft.avatar ? (
                <img src={draft.avatar} alt="Prévia" className="h-28 w-28 rounded-3xl object-cover shadow-soft" />
              ) : (
                <div className="grid h-28 w-28 place-items-center rounded-3xl bg-gradient-primary text-lg font-bold text-primary-foreground shadow-soft">
                  Foto
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => handleImage(event.target.files?.[0])}
              className="block w-full rounded-2xl border border-border bg-background p-3 text-sm"
            />
          </div>
        )}

        {section === "finance" && (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <FieldText label="Renda mensal">
              <input
                value={draft.income ?? ""}
                onChange={(event) => setDraft((current) => ({ ...current, income: Number(event.target.value.replace(/\D/g, "")) || undefined }))}
                className="h-11 w-full rounded-2xl border border-input bg-background px-3 text-sm font-bold outline-none focus-visible:ring-1 focus-visible:ring-ring"
                inputMode="numeric"
                placeholder="18000"
              />
            </FieldText>
            <FieldText label="Entrada disponível">
              <input
                value={draft.downPayment ?? ""}
                onChange={(event) => setDraft((current) => ({ ...current, downPayment: Number(event.target.value.replace(/\D/g, "")) || undefined }))}
                className="h-11 w-full rounded-2xl border border-input bg-background px-3 text-sm font-bold outline-none focus-visible:ring-1 focus-visible:ring-ring"
                inputMode="numeric"
                placeholder="120000"
              />
            </FieldText>
            <FieldText label="Objetivo principal">
              <select
                value={draft.needsFinancing === false ? "cash" : "financed"}
                onChange={(event) => setDraft((current) => ({ ...current, needsFinancing: event.target.value === "financed" }))}
                className="h-11 w-full rounded-2xl border border-input bg-background px-3 text-sm font-bold outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="financed">Comprar para morar</option>
                <option value="cash">Alugar ou investir</option>
              </select>
            </FieldText>
            <FieldText label="Momento da busca">
              <select
                value={draft.purchaseType ?? "soon"}
                onChange={(event) => setDraft((current) => ({ ...current, purchaseType: event.target.value }))}
                className="h-11 w-full rounded-2xl border border-input bg-background px-3 text-sm font-bold outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="exploring">Apenas explorando</option>
                <option value="planning">Próximos meses</option>
                <option value="soon">Quero decidir logo</option>
                <option value="urgent">Urgente</option>
              </select>
            </FieldText>
          </div>
        )}

        {section === "verification" && (
          <div className="mt-5 grid gap-4">
            <FieldText label="Documento para análise">
              <input
                value={draft.documentId ?? ""}
                onChange={(event) => setDraft((current) => ({ ...current, documentId: event.target.value, documentStatus: event.target.value ? "review" : "pending", identityVerified: false }))}
                className="h-11 w-full rounded-2xl border border-input bg-background px-3 text-sm font-bold outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="CPF, RG ou código interno"
              />
            </FieldText>
            <div className="rounded-2xl border border-border bg-background p-4 text-sm leading-relaxed text-muted-foreground">
              O envio coloca seu documento em análise. A confirmação de perfil verificado deve vir de um processo interno ou serviço de verificação, não do próprio usuário.
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="h-11 flex-1 rounded-2xl">
            Cancelar
          </Button>
          <Button type="button" onClick={() => onSave(section === "verification" ? { ...draft, identityVerified: false, documentStatus: draft.documentId ? "review" : "pending" } : draft)} className="h-11 flex-1 rounded-2xl bg-gradient-primary font-bold">
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}

function FieldText({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Row({
  icon: Icon,
  label,
  right,
  onClick,
  last,
  destructive,
}: {
  icon: any;
  label: string;
  right?: React.ReactNode;
  onClick?: () => void;
  last?: boolean;
  destructive?: boolean;
}) {
  const className = cn(
    "flex w-full items-center gap-4 px-5 py-4 text-left transition-colors",
    onClick && "hover:bg-secondary/50 active:bg-secondary",
    destructive && "text-destructive hover:bg-destructive/10",
    !last && "border-b border-border/50"
  );
  const content = (
    <>
      <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary/50 text-foreground", destructive && "bg-destructive/10 text-destructive")}>
        <Icon className="h-5 w-5" />
      </div>
      <span className="flex-1 text-sm font-bold lg:text-base">{label}</span>
      {right}
    </>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className={className}>
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
}





