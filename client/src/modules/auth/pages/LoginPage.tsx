import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, LockKeyhole, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/Button";
import { getApiErrorMessage } from "@/shared/api/httpClient";
import { useAuth } from "../components/AuthProvider";
import { AuthLayout } from "../components/AuthLayout";
import { extractAuthToken, extractAuthUser, login } from "../api/authApi";

export function LoginPage() {
  const navigate = useNavigate();
  const { saveSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);
      const response = await login({ email, password });
      const token = extractAuthToken(response);

      if (!token) {
        throw new Error("A API não retornou token de autenticação.");
      }

      saveSession(token, extractAuthUser(response));
      toast.success("Login realizado com sucesso.");
      navigate("/discover", { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout activeTab="login">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-foreground">Acesse sua conta</h1>
        <p className="mt-2 text-base leading-7 text-muted-foreground">Use seu email para continuar sua busca.</p>
      </div>

      <form className="grid gap-5" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm font-bold text-foreground">
          Email
          <div className="flex h-14 items-center gap-3 rounded-2xl border border-input bg-secondary px-4 shadow-sm focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
            <Mail className="size-5 text-muted-foreground" />
            <input
              className="h-full flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@email.com"
              required
            />
          </div>
        </label>

        <label className="grid gap-2 text-sm font-bold text-foreground">
          Senha
          <div className="flex h-14 items-center gap-3 rounded-2xl border border-input bg-secondary px-4 shadow-sm focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
            <LockKeyhole className="size-5 text-muted-foreground" />
            <input
              className="h-full flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              required
            />
            <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => setShowPassword((value) => !value)}>
              <Eye className="size-5" />
            </button>
          </div>
        </label>

        <Link to="/auth/register" className="w-fit text-sm font-extrabold text-primary hover:underline">
          Esqueci minha senha
        </Link>

        <Button type="submit" loading={loading} size="lg" className="h-14 rounded-2xl">
          Entrar
          <ArrowRight className="size-5" />
        </Button>
      </form>
    </AuthLayout>
  );
}
