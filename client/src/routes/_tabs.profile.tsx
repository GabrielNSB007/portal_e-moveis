import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
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
import { fmtCurrency, profileCompleteness, properties, SEARCH_STYLES, user } from "@/mock/data";
import { PropertyCard } from "@/components/emoveis/PropertyCard";
import { SectionHeader } from "@/components/emoveis/SectionHeader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/hooks/use-theme";
import { clearAuthToken, clearLegacyOnboardingFlag, clearSessionEmail } from "@/lib/auth-session";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_tabs/profile")({
  component: Profile,
});

function Profile() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [searchStyle, setSearchStyle] = useState("soon");
  const p = user.preferences;

  const stats = [
    { icon: Send, label: "Interesses", value: user.stats.interests },
    { icon: Sparkles, label: "Matches", value: user.stats.matches },
    { icon: Eye, label: "Vistos", value: user.stats.viewed },
  ];

  const logout = () => {
    clearAuthToken();
    clearSessionEmail();
    clearLegacyOnboardingFlag();
    toast.success("Ate logo!");
    navigate({ to: "/auth" });
  };

  return (
    <div className="mx-auto pb-24 lg:max-w-[1200px] lg:px-8 lg:py-8 lg:pb-12">
      
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
          <button className="grid h-10 w-10 place-items-center rounded-2xl bg-card shadow-soft transition-transform hover:scale-105 lg:h-12 lg:w-12">
            <Pencil className="h-4 w-4 lg:h-5 lg:w-5" />
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between lg:mt-8">
          <div className="flex min-w-0 items-center gap-4 lg:gap-6">
            <img
              src={user.avatar}
              className="h-20 w-20 shrink-0 rounded-3xl border-4 border-background object-cover shadow-card lg:h-28 lg:w-28 lg:rounded-[2rem]"
              alt={user.name}
            />
            <div className="min-w-0">
              <h2 className="truncate text-2xl font-bold tracking-tight lg:text-4xl">{user.name}</h2>
              <p className="truncate text-sm text-muted-foreground lg:mt-1 lg:text-base">{user.email}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-success lg:mt-3 lg:text-xs">
                <ShieldCheck className="h-3 w-3 lg:h-4 lg:w-4" /> Perfil verificado
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
            <span className="font-bold text-primary">{profileCompleteness}%</span>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-secondary lg:h-3">
            <div 
              className="h-full rounded-full bg-gradient-primary transition-all duration-1000 ease-out" 
              style={{ width: `${profileCompleteness}%` }} 
            />
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground lg:text-xs">
            Complete seus dados de renda e financiamento para receber recomendações ainda mais precisas no matchmaking.
          </p>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="mt-8 grid gap-8 px-5 lg:mt-12 lg:grid-cols-[1fr_360px] lg:px-0 xl:grid-cols-[1fr_400px] xl:gap-12">
        
        {/* COLUNA ESQUERDA (Principal) */}
        <div className="space-y-10">
          <Section title="Critérios de Matchmaking" subtitle="O que buscamos para você">
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

          <Section title="Dados do Comprador" subtitle="Informações protegidas">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:gap-4">
              <PrefCard icon={Pencil} label="Nome" value={user.name.split(' ')[0]} />
              <PrefCard icon={Mail} label="Email" value="Oculto" hint="Privado" />
              <PrefCard icon={Phone} label="Telefone" value={user.phone} />
              <PrefCard icon={Coins} label="Renda" value={fmtCurrency(user.income)} hint="Opcional" />
              <PrefCard icon={CreditCard} label="Compra" value={user.needsFinancing ? "Financiada" : "À vista"} />
              <PrefCard icon={Shield} label="Segurança" value={p.security ? "Prioridade" : "Normal"} />
            </div>
          </Section>

          {/* Imóveis Salvos Mobile (Oculto no Desktop) */}
          <div className="lg:hidden">
            <SavedProperties />
          </div>
        </div>

        {/* COLUNA DIREITA (Sidebar Desktop) */}
        <aside className="space-y-8">
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
            </div>
            
            <Button onClick={logout} variant="outline" className="mt-4 h-12 w-full rounded-2xl border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10 hover:text-destructive lg:h-14 lg:text-base">
              <LogOut className="mr-2 h-5 w-5" />
              Sair da conta
            </Button>
          </Section>

          {/* Imóveis Salvos Desktop */}
          <div className="hidden lg:block">
            <SavedProperties />
          </div>
        </aside>
      </div>

      <p className="mt-12 text-center text-xs font-medium text-muted-foreground/50 lg:mt-16">
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
      <div className="mt-4 flex gap-4 overflow-x-auto pb-4 no-scrollbar lg:grid lg:grid-cols-2 lg:overflow-visible lg:pb-0">
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
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 lg:mb-5">
        <h2 className="text-lg font-bold tracking-tight text-foreground lg:text-xl">{title}</h2>
        {subtitle && <p className="mt-1 text-xs text-muted-foreground lg:text-sm">{subtitle}</p>}
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

function Row({
  icon: Icon,
  label,
  right,
  onClick,
  last,
}: {
  icon: any;
  label: string;
  right: React.ReactNode;
  onClick?: () => void;
  last?: boolean;
}) {
  const className = cn(
    "flex w-full items-center gap-4 px-5 py-4 text-left transition-colors",
    onClick && "hover:bg-secondary/50 active:bg-secondary",
    !last && "border-b border-border/50"
  );
  const content = (
    <>
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary/50 text-foreground">
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
