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
import { fmtCurrency, properties, SEARCH_STYLES, user } from "@/mock/data";
import { PropertyCard } from "@/components/emoveis/PropertyCard";
import { SectionHeader } from "@/components/emoveis/SectionHeader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/hooks/use-theme";
import { clearAuthToken, clearLegacyOnboardingFlag, clearSessionEmail, setSessionEmail } from "@/lib/auth-session";
import api from "@/services/api";
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
  const [profileDraft, setProfileDraft] = useState<ProfileDraft>({ name: "", email: "", phone: "", password: "", currentPassword: "" });
  const p = user.preferences;

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
      toast.error(error?.response?.data?.error ?? "N?o foi poss?vel salvar os detalhes do perfil.");
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
  const income = extras.income ?? user.income;
  const needsFinancing = extras.needsFinancing ?? user.needsFinancing;
  const completion = Math.min(
    100,
    55 + (extras.avatar ? 15 : 0) + (extras.income ? 15 : 0) + (extras.documentStatus ? 15 : 0),
  );
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
      const { data } = await api.put<AuthProfile>("/auth/profile", { userRole: "VENDEDOR" });
      setProfile(data);
      toast.success("Área do anunciante ativada.");
      navigate({ to: "/agent" });
    } catch (error: any) {
      toast.error(error?.response?.data?.error ?? "Não foi possível ativar a área do anunciante.");
    } finally {
      setIsActivatingSeller(false);
    }
  };

  const stats = [
    { icon: Send, label: "Interesses", value: user.stats.interests },
    { icon: Sparkles, label: "Matches", value: user.stats.matches },
    { icon: Eye, label: "Vistos", value: user.stats.viewed },
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
        <div className="mx-auto rounded-3xl border border-border/50 bg-card p-5 shadow-lg lg:p-6">
          <div className="flex items-center justify-between text-xs lg:text-sm">
            <span className="font-bold text-foreground">Completude do perfil</span>
            <span className="font-bold text-primary">{completion}%</span>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-secondary lg:h-3">
            <div 
              className="h-full rounded-full bg-gradient-primary transition-all duration-1000 ease-out" 
              style={{ width: `${completion}%` }} 
            />
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground lg:text-xs">
            Complete seus dados de renda e financiamento para receber recomendações ainda mais precisas no matchmaking.
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
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:gap-4">
              <PrefCard icon={Coins} label="Faixa de preço" value={`${fmtCurrency(p.budget[0]).replace('R$', '')} - ${fmtCurrency(p.budget[1]).replace('R$', '')}`} />
              <PrefCard icon={MapPin} label="Bairros" value={p.neighborhoods.join(", ")} />
              <PrefCard icon={BedDouble} label="Quartos" value={`${p.bedrooms}+`} />
              <PrefCard icon={Bath} label="Banheiros" value={`${p.bathrooms}+`} />
              <PrefCard icon={Home} label="Tipo imóvel" value={p.types.join(", ")} />
              <PrefCard icon={Car} label="Garagem" value={`${p.parking}+`} />
              <PrefCard icon={PawPrint} label="Pet friendly" value={p.petFriendly ? "Sim" : "Não"} />
              <PrefCard icon={TrainFront} label="Próximo de" value={p.nearby.join(", ")} />
            </div>
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
              <PrefCard icon={Coins} label="Renda" value={fmtCurrency(income)} hint="Opcional" />
              <PrefCard icon={CreditCard} label="Objetivo" value={needsFinancing ? "Moradia financiada" : "Aluguel ou investimento"} />
              <PrefCard icon={Shield} label="Segurança" value={extras.identityVerified ? "Verificado" : extras.documentStatus === "review" ? "Em análise" : p.security ? "Prioridade" : "Normal"} />
            </div>
          </Section>

          <Section title="Completar perfil" subtitle="Dados usados para deixar o matchmaking mais preciso">
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
            <SavedProperties />
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
            onActivate={activateSellerPanel}
          />

          {/* Imóveis Salvos Desktop */}
          <div className="hidden lg:block">
            <SavedProperties />
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

function SavedProperties() {
  return (
    <div>
      <SectionHeader title="Imóveis Salvos" subtitle={`${user.stats.saved} imóveis`} />
      {/* Carrossel no Mobile, Grid no Desktop */}
      <div className="mt-3 flex gap-4 overflow-x-auto pb-2 no-scrollbar lg:grid lg:grid-cols-2 lg:overflow-visible lg:pb-0">
        {properties.slice(0, 4).map((pr) => (
          <div key={pr.id} className="w-[240px] shrink-0 lg:w-auto">
            <PropertyCard property={pr} compact />
          </div>
        ))}
      </div>
    </div>
  );
}

function Section({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
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
  onActivate,
}: {
  isSeller: boolean;
  isLoading: boolean;
  onActivate: () => void;
}) {
  return (
    <Section title="Área do anunciante" subtitle={isSeller ? "Painel liberado para anúncios" : "Ative quando quiser anunciar"}>
      <div className="rounded-3xl border border-primary/25 bg-primary/5 p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
            <Home className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-foreground">
              {isSeller ? "Seu painel está ativo" : "Virar anunciante"}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {isSeller
                ? "Gerencie seus imóveis sem misturar com sua busca de comprador."
                : "Libera o painel de anúncios mantendo este perfil de comprador separado."}
            </p>
          </div>
        </div>
        <Button
          type="button"
          onClick={onActivate}
          disabled={isLoading}
          className="mt-4 h-11 w-full rounded-2xl bg-gradient-primary font-bold"
        >
          {isLoading ? "Aguarde..." : isSeller ? "Abrir painel" : "Ativar painel"}
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
