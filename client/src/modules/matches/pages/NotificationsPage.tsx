import { useMemo, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Bell, CheckCircle2, Home, RefreshCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/Button";
import { EmptyState, ErrorState, LoadingState } from "@/shared/components/StateBlocks";
import { PageHeader } from "@/shared/components/PageHeader";
import { ScoreBadge } from "@/shared/components/ScoreBadge";
import { getApiErrorMessage } from "@/shared/api/httpClient";
import { formatCurrency } from "@/shared/utils/format";
import { cn } from "@/shared/utils/cn";
import { getPreferences } from "@/modules/preferences/api/preferencesApi";
import { getMyProposals, getReceivedProposals } from "@/modules/proposals/api/proposalsApi";
import { useAuth } from "@/modules/auth/components/AuthProvider";
import { getMatches, updateMatchStatus } from "../api/matchesApi";

export function NotificationsPage() {
  const queryClient = useQueryClient();
  const { profileMode } = useAuth();
  const isSellerMode = profileMode === "seller";
  const matchesQuery = useQuery({ queryKey: ["matches"], queryFn: getMatches, enabled: !isSellerMode });
  const preferencesQuery = useQuery({ queryKey: ["preferences", "active"], queryFn: () => getPreferences({ isActive: true }), enabled: !isSellerMode });
  const sentProposalsQuery = useQuery({ queryKey: ["proposals", "sent", "notifications"], queryFn: getMyProposals, enabled: !isSellerMode });
  const receivedProposalsQuery = useQuery({ queryKey: ["proposals", "received", "notifications"], queryFn: getReceivedProposals, enabled: isSellerMode });

  const markMutation = useMutation({
    mutationFn: (id: string) => updateMatchStatus(id, "VISUALIZADO"),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["matches"] });
      toast.success("Alerta marcado como visualizado.");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const ownedPreferenceIds = useMemo(() => new Set((preferencesQuery.data ?? []).map((preference) => preference.id)), [preferencesQuery.data]);
  const preferencesById = useMemo(() => new Map((preferencesQuery.data ?? []).map((preference) => [preference.id, preference])), [preferencesQuery.data]);
  const visibleMatches = useMemo(() => {
    if (isSellerMode || !preferencesQuery.data || preferencesQuery.data.length === 0) return [];
    return (matchesQuery.data ?? [])
      .filter((match) => ownedPreferenceIds.has(match.preferenceId))
      .map((match) => ({ ...match, preference: match.preference ?? preferencesById.get(match.preferenceId) }));
  }, [isSellerMode, matchesQuery.data, ownedPreferenceIds, preferencesById, preferencesQuery.data]);

  const newMatches = visibleMatches.filter((match) => match.status === "PENDENTE");
  const proposalMatches = visibleMatches.filter((match) => match.status === "PROPOSTA_ENVIADA");
  const viewedMatches = visibleMatches.filter((match) => match.status !== "PENDENTE" && match.status !== "PROPOSTA_ENVIADA");
  const acceptedProposals = (sentProposalsQuery.data ?? []).filter((proposal) => proposal.status === "ACEITA");
  const pendingReceived = (receivedProposalsQuery.data ?? []).filter((proposal) => proposal.status === "PENDENTE");
  const answeredReceived = (receivedProposalsQuery.data ?? []).filter((proposal) => proposal.status !== "PENDENTE");

  const isLoading = isSellerMode
    ? receivedProposalsQuery.isLoading
    : matchesQuery.isLoading || preferencesQuery.isLoading || sentProposalsQuery.isLoading;
  const error = isSellerMode
    ? receivedProposalsQuery.error
    : matchesQuery.error ?? preferencesQuery.error ?? sentProposalsQuery.error;
  const totalAlerts = isSellerMode
    ? pendingReceived.length + answeredReceived.length
    : newMatches.length + proposalMatches.length + acceptedProposals.length;

  return (
    <div>
      <PageHeader
        eyebrow="Central de alertas"
        title="Notificações"
        description={isSellerMode ? "Acompanhe propostas recebidas nos seus imóveis." : "Acompanhe novos imóveis compatíveis, interesses enviados e respostas dos vendedores."}
        action={
          <Button type="button" variant="secondary" onClick={() => {
            void matchesQuery.refetch();
            void preferencesQuery.refetch();
            void sentProposalsQuery.refetch();
            void receivedProposalsQuery.refetch();
          }}>
            <RefreshCcw className="size-4" />
            Atualizar
          </Button>
        }
      />

      {isLoading ? <LoadingState message="Carregando alertas..." /> : null}
      {error ? <ErrorState message={getApiErrorMessage(error)} onRetry={() => {
        void matchesQuery.refetch();
        void preferencesQuery.refetch();
        void sentProposalsQuery.refetch();
        void receivedProposalsQuery.refetch();
      }} /> : null}

      {!isLoading && !error && totalAlerts === 0 ? (
        <EmptyState
          title="Nenhum alerta ainda"
          description={isSellerMode ? "Novas propostas dos compradores aparecerão aqui." : "Novos matches e respostas de vendedores aparecerão aqui."}
          action={<Button type="button" onClick={() => window.location.assign(isSellerMode ? "/proposals" : "/preferences")}>{isSellerMode ? "Ver propostas" : "Ver interesses"}</Button>}
        />
      ) : null}

      {!isLoading && !error && totalAlerts > 0 ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
          <section className="grid gap-4">
            {isSellerMode ? (
              <>
                <AlertGroup title="Novas propostas" count={pendingReceived.length} tone="primary">
                  {pendingReceived.map((proposal) => (
                    <article key={proposal.id} className="rounded-[2rem] border border-primary/25 bg-card p-5 shadow-card">
                      <div className="flex items-start gap-4">
                        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary"><Bell className="size-5" /></span>
                        <div className="min-w-0 flex-1">
                          <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-extrabold text-primary">Novo comprador interessado</div>
                          <h3 className="mt-3 text-xl font-black text-foreground">{proposal.offer?.title ?? "Imóvel"}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">{proposal.buyer?.name ?? "Comprador"} enviou uma proposta.</p>
                          <p className="mt-2 font-black text-foreground">{formatCurrency(proposal.value)}</p>
                        </div>
                        <Link to="/proposals" className="text-sm font-extrabold text-primary hover:underline">Responder</Link>
                      </div>
                    </article>
                  ))}
                </AlertGroup>

                <AlertGroup title="Propostas respondidas" count={answeredReceived.length} tone="success">
                  {answeredReceived.map((proposal) => (
                    <article key={proposal.id} className="rounded-[2rem] border border-border bg-card p-5 shadow-sm">
                      <div className="flex items-start gap-4">
                        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-success/10 text-success"><CheckCircle2 className="size-5" /></span>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-black text-foreground">{proposal.offer?.title}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">Status: {proposal.status}</p>
                        </div>
                        <Link to="/proposals" className="text-sm font-extrabold text-primary hover:underline">Ver</Link>
                      </div>
                    </article>
                  ))}
                </AlertGroup>
              </>
            ) : (
              <>
                <AlertGroup title="Vendedores interessados" count={acceptedProposals.length} tone="success">
                  {acceptedProposals.map((proposal) => (
                    <article key={proposal.id} className="rounded-[2rem] border border-success/20 bg-card p-5 shadow-card">
                      <div className="flex items-start gap-4">
                        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-success/10 text-success"><Sparkles className="size-5" /></span>
                        <div className="min-w-0 flex-1">
                          <div className="inline-flex rounded-full bg-success/10 px-3 py-1 text-xs font-extrabold text-success">Contato aceito pelo vendedor</div>
                          <h3 className="mt-3 text-xl font-black text-foreground">{proposal.offer?.title ?? "Imóvel"}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">O vendedor aceitou seu interesse e deseja iniciar o contato.</p>
                        </div>
                        {proposal.offer ? <Link to={`/offers/${proposal.offer.id}`} className="text-sm font-extrabold text-primary hover:underline">Ver</Link> : null}
                      </div>
                    </article>
                  ))}
                </AlertGroup>

                <AlertGroup title="Novos matches" count={newMatches.length} tone="primary">
                  {newMatches.map((match) => (
                    <article key={match.id} className="rounded-[2rem] border border-primary/25 bg-card p-5 shadow-card">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-extrabold text-primary"><Bell className="size-4" />Novo imóvel compatível</div>
                          <h2 className="mt-3 text-xl font-black text-foreground">{match.offer?.title ?? "Imóvel compatível"}</h2>
                          <p className="mt-1 text-sm font-semibold text-muted-foreground">{match.offer?.neighborhood}, {match.offer?.city}/{match.offer?.state}</p>
                          {match.preference?.title ? <p className="mt-2 text-sm font-bold text-primary">Perfil: {match.preference.title}</p> : null}
                        </div>
                        <ScoreBadge score={match.score} />
                      </div>
                      <div className="mt-5 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                        <Info label="Preço" value={formatCurrency(match.offer?.price)} />
                        <Info label="Quartos" value={`${match.offer?.bedrooms ?? 0}`} />
                        <Info label="Vagas" value={`${match.offer?.parkingSpots ?? 0}`} />
                      </div>
                      <div className="mt-5 flex flex-wrap gap-3">
                        <Button type="button" onClick={() => markMutation.mutate(match.id)} loading={markMutation.isPending}><CheckCircle2 className="size-4" />Marcar como visto</Button>
                        <Link to={`/offers/${match.offerId}`} className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground transition hover:bg-secondary">Ver imóvel</Link>
                      </div>
                    </article>
                  ))}
                </AlertGroup>

                <AlertGroup title="Interesses enviados" count={proposalMatches.length} tone="success">
                  {proposalMatches.map((match) => (
                    <article key={match.id} className="rounded-[2rem] border border-border bg-card p-5 shadow-sm">
                      <div className="flex items-start gap-4">
                        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-success/10 text-success"><Home className="size-5" /></span>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-black text-foreground">{match.offer?.title}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">Você já iniciou contato com o vendedor desse imóvel.</p>
                        </div>
                        <Link to={`/offers/${match.offerId}`} className="text-sm font-extrabold text-primary hover:underline">Ver</Link>
                      </div>
                    </article>
                  ))}
                </AlertGroup>
              </>
            )}
          </section>

          <aside className="h-fit rounded-[2rem] border border-border bg-card p-5 shadow-card">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Resumo</p>
            <h2 className="mt-2 text-2xl font-black text-foreground">{totalAlerts} alerta(s)</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{isSellerMode ? "Alertas mostram compradores interessados nas suas ofertas." : "Alertas mostram matches novos e respostas dos vendedores aos seus interesses."}</p>
            <div className="mt-6 grid gap-3 text-sm font-bold text-muted-foreground">
              {isSellerMode ? (
                <>
                  <SummaryItem label="Novas propostas" value={pendingReceived.length} />
                  <SummaryItem label="Respondidas" value={answeredReceived.length} />
                </>
              ) : (
                <>
                  <SummaryItem label="Novos matches" value={newMatches.length} />
                  <SummaryItem label="Interesses enviados" value={proposalMatches.length} />
                  <SummaryItem label="Vendedor aceitou" value={acceptedProposals.length} />
                  <SummaryItem label="Outros" value={viewedMatches.length} />
                </>
              )}
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

function AlertGroup({ title, count, tone, children }: { title: string; count: number; tone: "primary" | "success"; children: ReactNode }) {
  if (count === 0) return null;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-black text-foreground">{title}</h2>
        <span className={cn("rounded-full px-3 py-1 text-xs font-black", tone === "primary" ? "bg-primary/10 text-primary" : "bg-success/10 text-success")}>{count}</span>
      </div>
      <div className="grid gap-4">{children}</div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-secondary p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-black text-foreground">{value}</p>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: number }) {
  return <div className="flex justify-between rounded-2xl bg-secondary p-3"><span>{label}</span><span>{value}</span></div>;
}
