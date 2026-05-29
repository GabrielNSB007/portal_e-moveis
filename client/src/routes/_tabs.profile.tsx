import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Bath,
  BedDouble,
  Bell,
  Building2,
  Car,
  ChevronRight,
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
    localStorage.removeItem("emoveis-onboarded");
    toast.success("Até logo!");
    navigate({ to: "/onboarding" });
  };

  return (
    <div className="pb-2 lg:px-8 lg:py-6">
      <div className="bg-gradient-hero px-4 pb-16 safe-top lg:rounded-3xl lg:border lg:border-border lg:px-8 lg:pb-8 lg:pt-8 lg:shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Perfil</h1>
            <p className="mt-1 hidden text-sm text-muted-foreground lg:block">
              Preferências, dados do comprador e estilo de busca.
            </p>
          </div>
          <button className="grid h-10 w-10 place-items-center rounded-2xl bg-card shadow-soft">
            <Pencil className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:mt-6 lg:gap-5">
          <div className="flex min-w-0 items-center gap-4">
            <img
              src={user.avatar}
              className="h-20 w-20 shrink-0 rounded-3xl border-4 border-card object-cover shadow-card"
              alt=""
            />
            <div className="min-w-0">
              <h2 className="truncate text-2xl font-bold tracking-tight lg:text-3xl">{user.name}</h2>
              <p className="truncate text-sm text-muted-foreground">{user.email}</p>
              <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-[10px] font-semibold text-success">
                <ShieldCheck className="h-3 w-3" /> Perfil verificado
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:w-[320px]">
            {stats.map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl bg-card/80 p-3 text-center shadow-soft backdrop-blur">
                <Icon className="mx-auto h-4 w-4 text-primary" />
                <div className="mt-1 text-lg font-bold">{value}</div>
                <div className="text-[10px] text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="-mt-12 px-4 lg:mt-6 lg:px-0">
        <div className="rounded-3xl bg-card p-4 shadow-card lg:max-w-none lg:p-5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold">Completude do perfil</span>
            <span className="font-bold text-primary">{profileCompleteness}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${profileCompleteness}%` }} />
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Complete renda e financiamento para receber recomendações mais precisas.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:mt-7 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-6 xl:grid-cols-[minmax(0,1fr)_380px] xl:gap-8">
        <div className="space-y-6">
          <Section title="Preferências" subtitle="Critérios usados no matchmaking">
            <div className="grid overflow-hidden rounded-3xl bg-card shadow-soft sm:grid-cols-2">
              <Pref icon={Coins} label="Faixa de preço" value={`${fmtCurrency(p.budget[0])} - ${fmtCurrency(p.budget[1])}`} />
              <Pref icon={MapPin} label="Bairros" value={p.neighborhoods.join(", ")} />
              <Pref icon={BedDouble} label="Quartos" value={`${p.bedrooms}+`} />
              <Pref icon={Bath} label="Banheiros" value={`${p.bathrooms}+`} />
              <Pref icon={Home} label="Tipo imóvel" value={p.types.join(", ")} />
              <Pref icon={Car} label="Garagem" value={`${p.parking}+`} />
              <Pref icon={PawPrint} label="Pet friendly" value={p.petFriendly ? "Sim" : "Não"} />
              <Pref icon={TrainFront} label="Próximo de" value={p.nearby.join(", ")} />
            </div>
          </Section>

          <Section title="Perfil comprador" subtitle="Dados liberados com cuidado no processo">
            <div className="grid overflow-hidden rounded-3xl bg-card shadow-soft sm:grid-cols-2">
              <Pref icon={Pencil} label="Nome" value={user.name} />
              <Pref icon={Mail} label="Email" value={user.email} />
              <Pref icon={Phone} label="Telefone" value={user.phone} />
              <Pref icon={Coins} label="Faixa financeira" value={fmtCurrency(user.income)} hint="opcional" />
              <Pref icon={CreditCard} label="Financiamento" value={user.needsFinancing ? "Sim" : "À vista"} />
              <Pref icon={Shield} label="Segurança" value={p.security ? "Prioridade" : "Indiferente"} />
            </div>
          </Section>

          <div className="lg:hidden">
            <SavedProperties />
          </div>
        </div>

        <aside className="space-y-6">
          <Section title="Estilo de busca">
            <div className="space-y-2">
              {SEARCH_STYLES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSearchStyle(s.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-2xl border bg-card p-3.5 text-left transition",
                    searchStyle === s.id
                      ? "border-primary bg-primary/5 shadow-soft"
                      : "border-border hover:border-primary/30"
                  )}
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">{s.label}</div>
                    <div className="text-[11px] text-muted-foreground">{s.desc}</div>
                  </div>
                  <div
                    className={cn(
                      "h-4 w-4 shrink-0 rounded-full border-2 transition",
                      searchStyle === s.id ? "border-primary bg-primary" : "border-border"
                    )}
                  />
                </button>
              ))}
            </div>
          </Section>

          <Section title="Configurações">
            <div className="overflow-hidden rounded-3xl bg-card shadow-soft">
              <Row icon={Bell} label="Notificações" right={<Switch defaultChecked />} />
              <Row
                icon={theme === "dark" ? Moon : Sun}
                label="Tema escuro"
                right={
                  <Switch
                    checked={theme === "dark"}
                    onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                  />
                }
              />
              <Row
                icon={Building2}
                label="Modo anunciante"
                right={<ChevronRight className="h-4 w-4 text-muted-foreground" />}
                onClick={() => navigate({ to: "/agent" })}
                last
              />
            </div>
            <Button onClick={logout} variant="outline" className="mt-4 h-11 w-full rounded-2xl border-border text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </Section>

          <div className="hidden lg:block">
            <SavedProperties />
          </div>
        </aside>
      </div>

      <p className="mt-8 text-center text-[10px] text-muted-foreground">
        Portal E-móveis · v1.0 · matchmaking imobiliário inteligente
      </p>
    </div>
  );
}

function SavedProperties() {
  return (
    <div>
      <SectionHeader title="Imóveis salvos" subtitle={`${user.stats.saved} imóveis`} />
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar lg:grid lg:grid-cols-2 lg:px-0">
        {properties.slice(0, 4).map((pr) => (
          <div key={pr.id} className="w-48 shrink-0 lg:w-auto">
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
    <section className="px-4 lg:px-0">
      <div className="mb-3">
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function Pref({
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
    <div className="flex min-w-0 items-center gap-3 border-b border-border px-4 py-3 sm:[&:nth-last-child(-n+2)]:border-b-0">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          {label}
          {hint && <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[9px]">{hint}</span>}
        </div>
        <div className="truncate text-sm font-medium">{value}</div>
      </div>
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
    "flex w-full items-center gap-3 px-4 py-3.5 text-left transition",
    onClick && "active:bg-secondary hover:bg-secondary/70",
    !last && "border-b border-border"
  );
  const content = (
    <>
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-secondary text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <span className="flex-1 text-sm font-medium">{label}</span>
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

  return (
    <div className={className}>
      {content}
    </div>
  );
}
