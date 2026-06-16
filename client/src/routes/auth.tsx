import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Home, Lock, Mail, Phone, UserRound } from "lucide-react";
import { Logo } from "@/components/emoveis/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  clearLegacyOnboardingFlag,
  hasCompletedOnboarding,
  setAuthToken,
  setSessionEmail,
} from "@/lib/auth-session";
import { cn } from "@/lib/utils";
import api from "@/services/api";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  component: Auth,
});

type Mode = "login" | "register";

function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "ana@emoveis.app",
    password: "123456",
  });

  const update = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = async () => {
    if (!form.email || !form.password || (mode === "register" && !form.name)) {
      toast.error("Preencha os campos obrigatorios.");
      return;
    }

    try {
      setIsSubmitting(true);

      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const payload =
        mode === "login"
          ? { email: form.email, password: form.password }
          : {
              email: form.email,
              password: form.password,
              name: form.name,
              phone: form.phone || undefined,
              userRole: "CLIENTE",
            };

      const { data } = await api.post<{ token: string }>(endpoint, payload);

      setAuthToken(data.token);
      setSessionEmail(form.email);
      clearLegacyOnboardingFlag();

      if (mode === "register") {
        toast.success("Conta criada. Agora vamos montar seu perfil.");
        navigate({ to: "/onboarding" });
        return;
      }

      const done = hasCompletedOnboarding(form.email);
      toast.success("Bem-vindo de volta.");
      navigate({ to: done ? "/explore" : "/onboarding" });
    } catch (error: any) {
      const message = error?.response?.data?.error ?? "Nao foi possivel autenticar agora.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[minmax(0,1fr)_480px]">
      <section className="relative hidden overflow-hidden bg-gradient-hero lg:block">
        <img
          src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />
        <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white">
          <Logo className="text-white" />
          <div className="max-w-xl pb-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur">
              <Home className="h-3.5 w-3.5" />
              Matchmaking imobiliario
            </div>
            <h1 className="mt-5 text-5xl font-bold leading-tight tracking-tight">
              Encontre, negocie e anuncie no mesmo lugar.
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-white/80">
              Primeiro entramos pelo perfil comprador. Quando fizer sentido, voce ativa a area do anunciante.
            </p>
          </div>
        </div>
      </section>

      <main className="flex min-h-screen items-center justify-center px-5 py-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>

          <div className="rounded-[2rem] border border-border bg-card p-5 shadow-card sm:p-7">
            <div className="mb-6">
              <div className="flex rounded-2xl bg-secondary p-1">
                <ModeButton active={mode === "login"} onClick={() => setMode("login")}>
                  Entrar
                </ModeButton>
                <ModeButton active={mode === "register"} onClick={() => setMode("register")}>
                  Criar conta
                </ModeButton>
              </div>
              <h2 className="mt-6 text-2xl font-bold tracking-tight">
                {mode === "login" ? "Acesse sua conta" : "Crie seu acesso"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {mode === "login"
                  ? "Use seu email para continuar sua busca."
                  : "Depois disso, montamos seu perfil de busca."}
              </p>
            </div>

            <div className="space-y-4">
              {mode === "register" && (
                <>
                  <Field label="Nome" icon={UserRound}>
                    <Input
                      value={form.name}
                      onChange={(event) => update("name", event.target.value)}
                      placeholder="Seu nome"
                      className="h-12 rounded-2xl bg-secondary pl-10"
                    />
                  </Field>
                  <Field label="Telefone" icon={Phone}>
                    <Input
                      value={form.phone}
                      onChange={(event) => update("phone", event.target.value)}
                      placeholder="+55 11 99999-0000"
                      className="h-12 rounded-2xl bg-secondary pl-10"
                    />
                  </Field>
                </>
              )}

              <Field label="Email" icon={Mail}>
                <Input
                  value={form.email}
                  onChange={(event) => update("email", event.target.value)}
                  type="email"
                  placeholder="voce@email.com"
                  className="h-12 rounded-2xl bg-secondary pl-10"
                />
              </Field>

              <Field label="Senha" icon={Lock}>
                <Input
                  value={form.password}
                  onChange={(event) => update("password", event.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimo 6 caracteres"
                  className="h-12 rounded-2xl bg-secondary pl-10 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute bottom-3 right-3 grid h-6 w-6 place-items-center text-muted-foreground"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </Field>
            </div>

            <Button
              onClick={submit}
              disabled={isSubmitting}
              className="mt-6 h-12 w-full rounded-2xl bg-gradient-primary text-base font-bold shadow-soft"
            >
              {isSubmitting ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-10 flex-1 rounded-xl text-sm font-bold transition",
        active ? "bg-card text-foreground shadow-soft" : "text-muted-foreground",
      )}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: typeof Mail;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <Label className="mb-2 block text-xs font-bold text-muted-foreground">{label}</Label>
      <Icon className="pointer-events-none absolute bottom-4 left-3 h-4 w-4 text-muted-foreground" />
      {children}
    </div>
  );
}
