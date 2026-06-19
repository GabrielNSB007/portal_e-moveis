import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Field";
import { ErrorState, LoadingState } from "@/shared/components/StateBlocks";
import { PageHeader } from "@/shared/components/PageHeader";
import { getApiErrorMessage } from "@/shared/api/httpClient";
import { getAuthToken } from "@/shared/api/tokenStorage";
import { useAuth } from "../components/AuthProvider";
import { deleteProfile, getProfile, updateProfile } from "../api/authApi";

export function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logout, saveSession, profileMode, canUseSeller, activateSellerMode, setProfileMode } = useAuth();
  const profileQuery = useQuery({ queryKey: ["profile"], queryFn: getProfile });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!profileQuery.data) return;
    setName(profileQuery.data.name ?? "");
    setEmail(profileQuery.data.email ?? "");
    setPhone(profileQuery.data.phone ?? "");
  }, [profileQuery.data]);

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: async (user) => {
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      const token = getAuthToken();
      if (token) saveSession(token, user);
      toast.success("Perfil atualizado com sucesso.");
      setPassword("");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProfile,
    onSuccess: () => {
      toast.success("Conta removida com sucesso.");
      logout();
      navigate("/auth/login", { replace: true });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateMutation.mutate({
      name,
      email,
      phone,
      ...(password ? { password } : {}),
    });
  }

  function handleDelete() {
    const confirmed = window.confirm("Tem certeza que deseja excluir sua conta?");
    if (confirmed) deleteMutation.mutate();
  }

  function enableSeller() {
    activateSellerMode();
    setProfileMode("seller");
    toast.success("Área de vendedor ativada.");
  }

  return (
    <div>
      <PageHeader
        eyebrow="Minha conta"
        title="Perfil"
        description="Atualize seus dados e escolha o modo de uso."
      />

      {profileQuery.isLoading ? <LoadingState message="Carregando perfil..." /> : null}
      {profileQuery.isError ? <ErrorState message={getApiErrorMessage(profileQuery.error)} onRetry={() => void profileQuery.refetch()} /> : null}

      {profileQuery.isSuccess ? (
        <div className="grid max-w-5xl items-start gap-4 xl:grid-cols-[1fr_280px]">
          <form className="h-fit rounded-[1.5rem] border border-border bg-card p-4 shadow-card" onSubmit={handleSubmit}>
            <div className="grid gap-3 md:grid-cols-2">
              <Input label="Nome" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Maria Oliveira" required />
              <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Ex.: maria@email.com" required />
              <Input label="Telefone" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Ex.: 81999999999" />
              <Input label="Nova senha" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Preencha só se quiser trocar" />
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <Button type="submit" loading={updateMutation.isPending}>Salvar alterações</Button>
              <Button type="button" variant="ghost" onClick={() => profileQuery.refetch()}>Restaurar dados</Button>
            </div>
          </form>

          <aside className="h-fit rounded-[1.5rem] border border-border bg-card p-4 shadow-card">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Tipo de perfil</p>
            <h2 className="mt-2 text-xl font-black text-foreground">
              {profileMode === "seller" ? "Vendedor" : "Comprador"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Use o modo comprador para buscar imóveis e o modo vendedor para cadastrar ofertas.
            </p>

            <div className="mt-4 grid gap-2">
              <Button type="button" variant={profileMode === "buyer" ? "primary" : "secondary"} onClick={() => setProfileMode("buyer")}>
                Usar como comprador
              </Button>
              {canUseSeller ? (
                <Button type="button" variant={profileMode === "seller" ? "primary" : "secondary"} onClick={() => setProfileMode("seller")}>
                  Usar como vendedor
                </Button>
              ) : (
                <Button type="button" variant="secondary" onClick={enableSeller}>
                  Ativar perfil vendedor
                </Button>
              )}
            </div>

            <div className="mt-4 rounded-2xl bg-secondary p-3 text-xs text-muted-foreground">
              <strong className="text-foreground">Email atual:</strong>
              <br />
              {profileQuery.data.email}
            </div>

            <Button type="button" variant="ghost" className="mt-3 w-full justify-center text-destructive" loading={deleteMutation.isPending} onClick={handleDelete}>
              Excluir conta
            </Button>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
