import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Field";
import { getApiErrorMessage } from "@/shared/api/httpClient";
import { useAuth } from "../components/AuthProvider";
import { AuthLayout } from "../components/AuthLayout";
import { extractAuthToken, extractAuthUser, register } from "../api/authApi";

export function RegisterPage() {
  const navigate = useNavigate();
  const { saveSession } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast.error("As senhas não conferem.");
      return;
    }

    try {
      setLoading(true);
      const response = await register({ name, email, phone, password, userRole: "CLIENTE" });
      const token = extractAuthToken(response);

      if (!token) throw new Error("Não foi possível iniciar sua sessão.");

      saveSession(token, extractAuthUser(response));
      toast.success("Conta criada. Agora informe suas preferências.");
      navigate("/onboarding/preferences", { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout activeTab="buyer">
      <div className="mb-5">
        <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">Criar conta de comprador</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Salve suas preferências e acompanhe imóveis compatíveis.
        </p>
      </div>

      <form className="grid gap-3" onSubmit={handleSubmit}>
        <Input label="Nome completo" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Maria Oliveira" required />
        <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Ex.: maria@email.com" required />
        <Input label="Telefone" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Ex.: 81999999999" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Senha" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo 6 caracteres" minLength={6} required />
          <Input label="Confirmar senha" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repita a senha" minLength={6} required />
        </div>
        <Button type="submit" loading={loading} size="lg" className="mt-1 w-full rounded-2xl">
          Criar conta e continuar
          <ArrowRight className="size-5" />
        </Button>
      </form>
    </AuthLayout>
  );
}
