import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/shared/components/Button";
import { EmptyState, ErrorState, LoadingState } from "@/shared/components/StateBlocks";
import { PageHeader } from "@/shared/components/PageHeader";
import { PROPOSAL_STATUS_LABEL } from "@/shared/constants/enums";
import type { Proposal } from "@/shared/types/domain";
import { getApiErrorMessage } from "@/shared/api/httpClient";
import { formatCurrency } from "@/shared/utils/format";
import { markOfferAsNegotiated } from "@/shared/utils/negotiationStorage";
import { useAuth } from "@/modules/auth/components/AuthProvider";
import { updateOfferStatus } from "@/modules/offers/api/offersApi";
import { cancelProposal, getMyProposals, getReceivedProposals, updateProposalStatus } from "../api/proposalsApi";

export function ProposalsPage() {
  const queryClient = useQueryClient();
  const { profileMode } = useAuth();
  const isSellerMode = profileMode === "seller";
  const proposalsQuery = useQuery({
    queryKey: ["proposals", isSellerMode ? "received" : "sent"],
    queryFn: isSellerMode ? getReceivedProposals : getMyProposals,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelProposal,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["proposals"] });
      toast.success("Proposta cancelada.");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, offerId, status }: { id: string; offerId?: string; status: "ACEITA" | "RECUSADA" }) => {
      const proposal = await updateProposalStatus(id, status);

      if (status === "ACEITA") {
        const negotiatedOfferId = proposal.offerId ?? offerId;

        if (negotiatedOfferId) {
          markOfferAsNegotiated({
            offerId: negotiatedOfferId,
            proposalId: proposal.id,
            buyerId: proposal.buyerId,
            sellerId: proposal.offer?.userId ?? proposal.offer?.user?.id,
          });

          try {
            await updateOfferStatus(negotiatedOfferId, "PAUSADA");
          } catch (error) {
            console.warn("Não foi possível atualizar o status da oferta automaticamente.", error);
          }
        }
      }

      return proposal;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["proposals"] }),
        queryClient.invalidateQueries({ queryKey: ["offers"] }),
        queryClient.invalidateQueries({ queryKey: ["matches"] }),
      ]);
      toast.success("Status atualizado.");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  return (
    <div>
      <PageHeader
        eyebrow={isSellerMode ? "Área de vendedor" : "Contato com vendedores"}
        title={isSellerMode ? "Propostas recebidas" : "Minhas propostas"}
        description={isSellerMode ? "Acompanhe interessados nos seus imóveis." : "Acompanhe mensagens e propostas enviadas."}
      />

      {proposalsQuery.isLoading ? <LoadingState message="Carregando propostas..." /> : null}
      {proposalsQuery.isError ? <ErrorState message={getApiErrorMessage(proposalsQuery.error)} onRetry={() => void proposalsQuery.refetch()} /> : null}

      {proposalsQuery.isSuccess && proposalsQuery.data.length === 0 ? (
        <EmptyState
          title={isSellerMode ? "Nenhuma proposta recebida" : "Nenhuma proposta enviada"}
          description={isSellerMode ? "As propostas aparecerão quando compradores demonstrarem interesse." : "Entre em um imóvel e envie uma mensagem para iniciar contato."}
          action={<Button type="button" onClick={() => window.location.assign(isSellerMode ? "/advertiser" : "/discover")}>{isSellerMode ? "Cadastrar oferta" : "Descobrir imóveis"}</Button>}
        />
      ) : null}

      {proposalsQuery.isSuccess && proposalsQuery.data.length > 0 ? (
        <div className="grid gap-4">
          {proposalsQuery.data.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              isSellerMode={isSellerMode}
              busy={cancelMutation.isPending || statusMutation.isPending}
              onCancel={() => cancelMutation.mutate(proposal.id)}
              onAccept={() => statusMutation.mutate({ id: proposal.id, offerId: proposal.offerId, status: "ACEITA" })}
              onReject={() => statusMutation.mutate({ id: proposal.id, status: "RECUSADA" })}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ProposalCard({
  proposal,
  isSellerMode,
  busy,
  onCancel,
  onAccept,
  onReject,
}: {
  proposal: Proposal;
  isSellerMode: boolean;
  busy: boolean;
  onCancel: () => void;
  onAccept: () => void;
  onReject: () => void;
}) {
  const offer = proposal.offer;

  return (
    <article className="rounded-[2rem] border border-border bg-card p-5 shadow-card">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex flex-wrap gap-2">
            <span className={statusClass(proposal.status)}>{PROPOSAL_STATUS_LABEL[proposal.status]}</span>
            {proposal.status === "ACEITA" ? <span className="inline-flex rounded-full bg-success/10 px-3 py-1 text-xs font-extrabold text-success">Em negociação</span> : null}
          </div>
          <h2 className="mt-3 text-xl font-extrabold text-foreground">{offer?.title ?? "Imóvel"}</h2>
          {offer ? <p className="mt-1 text-sm font-medium text-muted-foreground">{offer.neighborhood}, {offer.city}/{offer.state}</p> : null}
          {isSellerMode && proposal.buyer ? <p className="mt-2 text-sm font-semibold text-muted-foreground">Interessado: {proposal.buyer.name}</p> : null}
        </div>
        <p className="text-2xl font-extrabold text-foreground">{formatCurrency(proposal.value)}</p>
      </div>

      {proposal.message ? <p className="mt-4 rounded-2xl bg-secondary/60 p-4 text-sm leading-6 text-muted-foreground">{proposal.message}</p> : null}

      <div className="mt-5 flex flex-wrap gap-3">
        {offer ? <Button type="button" variant="secondary" onClick={() => window.location.assign(`/offers/${offer.id}`)}>Ver imóvel</Button> : null}
        {!isSellerMode && proposal.status === "PENDENTE" ? <Button type="button" variant="danger" loading={busy} onClick={onCancel}>Cancelar proposta</Button> : null}
        {isSellerMode && proposal.status === "PENDENTE" ? (
          <>
            <Button type="button" loading={busy} onClick={onAccept}>Aceitar</Button>
            <Button type="button" variant="danger" loading={busy} onClick={onReject}>Recusar</Button>
          </>
        ) : null}
      </div>
    </article>
  );
}

function statusClass(status: Proposal["status"]) {
  const base = "inline-flex rounded-full px-3 py-1 text-xs font-extrabold";

  if (status === "ACEITA") return `${base} bg-success/10 text-success`;
  if (status === "RECUSADA") return `${base} bg-destructive/10 text-destructive`;
  if (status === "CANCELADA") return `${base} bg-muted text-muted-foreground`;
  return `${base} bg-warning/20 text-foreground`;
}
