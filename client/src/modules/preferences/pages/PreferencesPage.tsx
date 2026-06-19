import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Power, PowerOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/Button";
import { EmptyState, ErrorState, LoadingState } from "@/shared/components/StateBlocks";
import { PageHeader } from "@/shared/components/PageHeader";
import { AMENITY_LABEL, PROPERTY_TYPE_LABEL } from "@/shared/constants/enums";
import { formatCurrency, formatNumber } from "@/shared/utils/format";
import { getApiErrorMessage } from "@/shared/api/httpClient";
import { activatePreference, deactivatePreference, getPreferences } from "../api/preferencesApi";

export function PreferencesPage() {
  const queryClient = useQueryClient();
  const preferencesQuery = useQuery({ queryKey: ["preferences"], queryFn: () => getPreferences() });

  const deactivateMutation = useMutation({
    mutationFn: deactivatePreference,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["preferences"] });
      await queryClient.invalidateQueries({ queryKey: ["matches"] });
      toast.success("Preferência desativada.");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const activateMutation = useMutation({
    mutationFn: activatePreference,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["preferences"] });
      toast.success("Preferência ativada novamente.");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  function handleDeactivate(id: string) {
    const confirmed = window.confirm("Deseja desativar esta preferência?");
    if (confirmed) deactivateMutation.mutate(id);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Meu perfil de busca"
        title="Interesses cadastrados"
        description="Gerencie as preferências que orientam seus matches de imóveis."
        action={<Button type="button" onClick={() => window.location.assign("/onboarding/preferences")}>Nova preferência</Button>}
      />

      {preferencesQuery.isLoading ? <LoadingState message="Carregando preferências..." /> : null}
      {preferencesQuery.isError ? <ErrorState message={getApiErrorMessage(preferencesQuery.error)} onRetry={() => void preferencesQuery.refetch()} /> : null}

      {preferencesQuery.isSuccess && preferencesQuery.data.length === 0 ? (
        <EmptyState
          title="Nenhuma preferência cadastrada"
          description="Cadastre sua primeira preferência para receber imóveis compatíveis automaticamente."
          action={<Button type="button" onClick={() => window.location.assign("/onboarding/preferences")}>Cadastrar preferência</Button>}
        />
      ) : null}

      {preferencesQuery.isSuccess && preferencesQuery.data.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {preferencesQuery.data.map((preference) => (
            <article key={preference.id} className="rounded-[2rem] border border-border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:border-primary/30">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-foreground">{preference.title ?? "Preferência"}</h2>
                  <p className="mt-1 text-sm font-medium text-muted-foreground">{preference.city}/{preference.state}</p>
                </div>
                <span className={preference.isActive ? "rounded-full bg-success/10 px-3 py-1 text-xs font-bold text-success" : "rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground"}>
                  {preference.isActive ? "Ativa" : "Desativada"}
                </span>
              </div>

              <div className="mt-5 grid gap-2 text-sm text-muted-foreground">
                <p><strong className="text-foreground">Bairros:</strong> {preference.neighborhoods.join(", ") || "Todos"}</p>
                <p><strong className="text-foreground">Preço:</strong> {formatCurrency(preference.minPrice)} até {formatCurrency(preference.maxPrice)}</p>
                <p><strong className="text-foreground">Área:</strong> {formatNumber(preference.minAreaM2, " m²")} até {formatNumber(preference.maxAreaM2, " m²")}</p>
                <p><strong className="text-foreground">Tipos:</strong> {preference.propertyTypes.map((type) => PROPERTY_TYPE_LABEL[type]).join(", ") || "Sem preferência"}</p>
                <p><strong className="text-foreground">Comodidades:</strong> {preference.desiredAmenities.map((amenity) => AMENITY_LABEL[amenity]).join(", ") || "Sem preferência"}</p>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link to="/matches" className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground transition hover:bg-secondary">Ver matches</Link>
                {preference.isActive ? (
                  <Button type="button" variant="ghost" loading={deactivateMutation.isPending} onClick={() => handleDeactivate(preference.id)}>
                    <PowerOff className="size-4" />
                    Desativar
                  </Button>
                ) : (
                  <Button type="button" variant="ghost" loading={activateMutation.isPending} onClick={() => activateMutation.mutate(preference.id)}>
                    <Power className="size-4" />
                    Reativar
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
