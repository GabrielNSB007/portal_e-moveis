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
  migrateLegacyOnboardingFlag,
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

const DDD_OPTIONS = [
  { value: "11", label: "11 - Sao Paulo" },
  { value: "21", label: "21 - Rio de Janeiro" },
  { value: "31", label: "31 - Belo Horizonte" },
  { value: "41", label: "41 - Curitiba" },
  { value: "48", label: "48 - Florianopolis" },
  { value: "51", label: "51 - Porto Alegre" },
  { value: "61", label: "61 - Brasilia" },
  { value: "71", label: "71 - Salvador" },
  { value: "81", label: "81 - Recife" },
  { value: "85", label: "85 - Fortaleza" },
];

const onlyDigits = (value: string) => value.replace(/\D/g, "");

const formatPhoneNumber = (value: string) => {
  const digits = onlyDigits(value).slice(0, 9);

  if (digits.length <= 4) return digits;
  if (digits.length <= 8) return `${digits.slice(0, 4)}-${digits.slice(4)}`;

  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
};


function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneDdd, setPhoneDdd] = useState("11");
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [isRecoveryLoading, setIsRecoveryLoading] = useState(false);
  const [recoverySent, setRecoverySent] = useState(false);
  const [recovery, setRecovery] = useState({ email: "", code: "", password: "" });
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "ana@emoveis.app",
    password: "123456",
  });

  const update = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };


  const requestRecoveryCode = async () => {
    const email = recovery.email.trim() || form.email.trim();
    if (!email) {
      toast.error("Informe seu email.");
      return;
    }

    setIsRecoveryLoading(true);
    try {
      await api.post("/auth/password/recovery", { email });
      setRecovery((current) => ({ ...current, email }));
      setRecoverySent(true);
      toast.success("C?digo de recupera??o enviado.");
    } catch (error: any) {
      toast.error(error?.response?.data?.error ?? "N?o foi poss?vel enviar o c?digo.");
    } finally {
      setIsRecoveryLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!recovery.email || !recovery.code || !recovery.password) {
      toast.error("Preencha email, c?digo e nova senha.");
      return;
    }

    setIsRecoveryLoading(true);
    try {
      await api.post("/auth/password/reset", recovery);
      toast.success("Senha atualizada. Entre com a nova senha.");
      setForm((current) => ({ ...current, email: recovery.email, password: "" }));
      setIsRecoveryOpen(false);
      setRecoverySent(false);
      setRecovery({ email: "", code: "", password: "" });
    } catch (error: any) {
      toast.error(error?.response?.data?.error ?? "N?o foi poss?vel redefinir a senha.");
    } finally {
      setIsRecoveryLoading(false);
    }
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
              phone: form.phone ? `+55 ${phoneDdd} ${form.phone}` : undefined,
              userRole: "CLIENTE",
            };

      const { data } = await api.post<{ token: string }>(endpoint, payload);

      setAuthToken(data.token);
      setSessionEmail(form.email);

      if (mode === "register") {
        clearLegacyOnboardingFlag();
        toast.success("Conta criada. Agora vamos montar seu perfil.");
        navigate({ to: "/onboarding" });
        return;
      }

      migrateLegacyOnboardingFlag(form.email);
      const done = hasCompletedOnboarding(form.email);
      toast.success("Bem-vindo de volta.");
      navigate({ to: done ? "/explore" : "/onboarding" });
    } catch (error: any) {
      const message = error?.response?.data?.error ?? "Não foi possível autenticar agora.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid h-dvh overflow-hidden bg-background lg:grid-cols-[minmax(0,1fr)_480px]">
      <section className="relative hidden min-h-0 overflow-hidden bg-gradient-hero lg:block">
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

      <main className="min-h-0 overflow-y-auto px-5 py-8">
        <div className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>

          <div className="min-h-[520px] rounded-[2rem] border border-border bg-card p-5 shadow-card sm:p-7">
            <div className="mb-6">
              <div className="grid grid-cols-2 rounded-2xl bg-secondary p-1">
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
              <p className="mt-1 min-h-10 text-sm text-muted-foreground">
                {mode === "login"
                  ? "Use seu email para continuar sua busca."
                  : "Depois disso, montamos seu perfil de busca."}
              </p>
            </div>

            <div className="space-y-4">
              <div className={cn("grid gap-4 transition-all", mode === "register" ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                <div className="min-h-0 overflow-hidden">
                  <div className="space-y-4">
                    <Field label="Nome" icon={UserRound}>
                      <Input
                        value={form.name}
                        onChange={(event) => update("name", event.target.value)}
                        placeholder="Seu nome"
                        className="h-12 rounded-2xl bg-secondary pl-10"
                      />
                    </Field>
                    <div>
                      <Label className="mb-2 block text-xs font-bold text-muted-foreground">Telefone</Label>
                      <div className="grid grid-cols-[132px_minmax(0,1fr)] gap-2">
                        <div className="relative">
                          <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <select
                            value={phoneDdd}
                            onChange={(event) => setPhoneDdd(event.target.value)}
                            className="h-12 w-full appearance-none rounded-2xl border border-input bg-secondary px-9 text-sm font-semibold outline-none transition-colors focus-visible:ring-1 focus-visible:ring-ring"
                          >
                            {DDD_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <Input
                          value={form.phone}
                          onChange={(event) => update("phone", formatPhoneNumber(event.target.value))}
                          placeholder="99999-0000"
                          className="h-12 rounded-2xl bg-secondary"
                          inputMode="numeric"
                          type="tel"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

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
              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => {
                    setRecovery((current) => ({ ...current, email: form.email }));
                    setIsRecoveryOpen(true);
                  }}
                  className="text-sm font-bold text-primary hover:underline"
                >
                  Esqueci minha senha
                </button>
              )}
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

      <PasswordRecoveryModal
        open={isRecoveryOpen}
        sent={recoverySent}
        loading={isRecoveryLoading}
        recovery={recovery}
        onChange={(patch) => setRecovery((current) => ({ ...current, ...patch }))}
        onRequestCode={requestRecoveryCode}
        onReset={resetPassword}
        onClose={() => setIsRecoveryOpen(false)}
      />
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


function PasswordRecoveryModal({
  open,
  sent,
  loading,
  recovery,
  onChange,
  onRequestCode,
  onReset,
  onClose,
}: {
  open: boolean;
  sent: boolean;
  loading: boolean;
  recovery: { email: string; code: string; password: string };
  onChange: (patch: Partial<{ email: string; code: string; password: string }>) => void;
  onRequestCode: () => void;
  onReset: () => void;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold">Recuperar senha</h3>
            <p className="mt-1 text-sm text-muted-foreground">Enviaremos um c?digo para o email cadastrado.</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-sm font-bold">x</button>
        </div>

        <div className="mt-5 space-y-4">
          <Field label="Email" icon={Mail}>
            <Input value={recovery.email} onChange={(event) => onChange({ email: event.target.value })} className="h-12 rounded-2xl bg-secondary pl-10" placeholder="voce@email.com" />
          </Field>
          {sent && (
            <>
              <Field label="C?digo" icon={Lock}>
                <Input value={recovery.code} onChange={(event) => onChange({ code: event.target.value })} className="h-12 rounded-2xl bg-secondary pl-10" placeholder="000000" inputMode="numeric" />
              </Field>
              <Field label="Nova senha" icon={Lock}>
                <Input value={recovery.password} onChange={(event) => onChange({ password: event.target.value })} className="h-12 rounded-2xl bg-secondary pl-10" type="password" placeholder="M?nimo 6 caracteres" />
              </Field>
            </>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="h-11 flex-1 rounded-2xl" disabled={loading}>Cancelar</Button>
          <Button type="button" onClick={sent ? onReset : onRequestCode} className="h-11 flex-1 rounded-2xl bg-gradient-primary font-bold" disabled={loading}>
            {loading ? "Aguarde..." : sent ? "Redefinir" : "Enviar c?digo"}
          </Button>
        </div>
      </div>
    </div>
  );
}
