import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { CheckCircle2, Home, Sparkles } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import logoSrc from "@/assets/logo.png";

type AuthLayoutProps = {
  children: ReactNode;
  activeTab?: "login" | "buyer" | "seller";
  headline?: string;
  description?: string;
};

const tabs = [
  { to: "/auth/login", label: "Entrar", value: "login" },
  { to: "/auth/register", label: "Criar conta", value: "buyer" },
] as const;

export function AuthLayout({
  children,
  activeTab = "login",
  headline = "Encontre, negocie e anuncie no mesmo lugar.",
  description = "Escolha seu perfil, salve suas informações e avance para os imóveis certos.",
}: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen bg-[#f7f7fb] lg:grid-cols-[minmax(0,1fr)_560px] xl:grid-cols-[minmax(0,1fr)_620px]">
      <section className="relative hidden min-h-screen overflow-hidden lg:block">
        <div
          className="absolute inset-0 bg-cover"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1800&q=85')",
            backgroundPosition: "center center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/18 via-black/25 to-black/78" />
        <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white xl:p-12">
          <Link to="/auth/login" className="flex w-fit items-center gap-3 rounded-2xl bg-white/90 px-3 py-2 font-display text-xl font-extrabold text-foreground shadow-xl backdrop-blur">
            <span className="grid size-10 place-items-center text-primary">
              <img src={logoSrc} alt="Portal E-móveis" className="size-10 object-contain" />
            </span>
            <span>
              Portal <strong className="text-[#8b5cf6]">E-móveis</strong>
            </span>
          </Link>

          <div className="max-w-2xl pb-10 xl:pb-14">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-extrabold backdrop-blur">
              <Home className="size-4" />
              Matchmaking imobiliário
            </div>
            <h1 className="text-5xl font-black leading-[1.12] tracking-tight drop-shadow-sm xl:text-6xl">{headline}</h1>
            <p className="mt-5 max-w-xl text-lg font-medium leading-8 text-white/90 xl:text-xl xl:leading-9">{description}</p>

            <div className="mt-7 grid max-w-xl gap-3 text-sm font-bold text-white/90">
              {["Cadastro por perfil", "Preferências salvas", "Contato por proposta"].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="size-5 text-[#a78bfa]" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid min-h-screen place-items-center px-4 py-5 sm:px-6">
        <div className="w-full max-w-[520px] rounded-[1.8rem] border border-border bg-card p-5 shadow-card sm:p-6 lg:max-h-[calc(100vh-2.5rem)] lg:overflow-y-auto">
          <div className="mb-6 flex rounded-[1.35rem] bg-secondary p-1">
            {tabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  cn(
                    "flex-1 rounded-[1.1rem] px-4 py-2.5 text-center text-sm font-extrabold transition",
                    (isActive || activeTab === tab.value || (activeTab === "seller" && tab.value === "buyer"))
                      ? "bg-white text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </div>

          {children}

          {activeTab !== "seller" ? (
            <div className="mt-5 rounded-3xl border border-primary/15 bg-primary/5 p-4">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
                  <Sparkles className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-extrabold text-foreground">Também é anunciante?</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Cadastre imóveis e receba interessados qualificados.
                  </p>
                  <Link to="/auth/register-seller" className="mt-2 inline-block text-sm font-extrabold text-primary hover:underline">
                    Criar conta de vendedor
                  </Link>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
