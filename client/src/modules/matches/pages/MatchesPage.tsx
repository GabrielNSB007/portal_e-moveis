import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/Button";
import { EmptyState, ErrorState, LoadingState } from "@/shared/components/StateBlocks";
import { PageHeader } from "@/shared/components/PageHeader";
import { getApiErrorMessage } from "@/shared/api/httpClient";
import { getPreferences } from "@/modules/preferences/api/preferencesApi";
import { getMyProposals } from "@/modules/proposals/api/proposalsApi";
import type { Match } from "@/shared/types/domain";
import { getNegotiatedOfferIds, syncAcceptedProposalsAsNegotiated } from "@/shared/utils/negotiationStorage";
import { deleteMatch, generateMatches, getMatches } from "../api/matchesApi";
import { MatchCard } from "../components/MatchCard";

export function MatchesPage() {
  const queryClient = useQueryClient();
  const [negotiatedOfferIds, setNegotiatedOfferIds] = useState(() => getNegotiatedOfferIds());
  const matchesQuery = useQuery({ queryKey: ["matches"], queryFn: getMatches });
  const preferencesQuery = useQuery({ queryKey: ["preferences", "active"], queryFn: () => getPreferences({ isActive: true }) });
  const proposalsQuery = useQuery({ queryKey: ["proposals", "sent", "matches"], queryFn: getMyProposals });

  const ownedPreferenceIds = useMemo(() => new Set((preferencesQuery.data ?? []).map((preference) => preference.id)), [preferencesQuery.data]);
  const preferencesById = useMemo(() => new Map((preferencesQuery.data ?? []).map((preference) => [preference.id, preference])), [preferencesQuery.data]);
  const acceptedProposalsByOffer = useMemo(() => {
    const map = new Map<string, true>();
    (proposalsQuery.data ?? [])
      .filter((proposal) => proposal.status === "ACEITA")
      .forEach((proposal) => map.set(proposal.offerId, true));
    return map;
  }, [proposalsQuery.data]);

  useEffect(() => {
    function refreshNegotiatedOffers() {
      setNegotiatedOfferIds(getNegotiatedOfferIds());
    }

    window.addEventListener("storage", refreshNegotiatedOffers);
    window.addEventListener("portal-emoveis:negotiations-updated", refreshNegotiatedOffers);

    return () => {
      window.removeEventListener("storage", refreshNegotiatedOffers);
      window.removeEventListener("portal-emoveis:negotiations-updated", refreshNegotiatedOffers);
    };
  }, []);

  useEffect(() => {
    syncAcceptedProposalsAsNegotiated(proposalsQuery.data);
    setNegotiatedOfferIds(getNegotiatedOfferIds());
  }, [proposalsQuery.data]);


  const visibleMatches = useMemo(() => {
    if (!preferencesQuery.data || preferencesQuery.data.length === 0) return [];

    const ownedMatches = (matchesQuery.data ?? [])
      .filter((match) => ownedPreferenceIds.has(match.preferenceId))
      .map((match) => ({ ...match, preference: match.preference ?? preferencesById.get(match.preferenceId) }))
      .filter((match) => {
        const isConfirmedForMe = acceptedProposalsByOffer.has(match.offerId);
        const offerUnavailable = Boolean(match.offer?.status && match.offer.status !== "ATIVA");
        const globallyNegotiated = negotiatedOfferIds.has(match.offerId);

        if ((offerUnavailable || globallyNegotiated) && !isConfirmedForMe) return false;
        return true;
      })
      .sort((a, b) => b.score - a.score);

    const confirmedByOffer = new Map<string, Match>();
    const regularMatches: Match[] = [];

    ownedMatches.forEach((match) => {
      if (acceptedProposalsByOffer.has(match.offerId)) {
        const previous = confirmedByOffer.get(match.offerId);
        if (!previous || match.score > previous.score || match.status === "PROPOSTA_ENVIADA") {
          confirmedByOffer.set(match.offerId, match);
        }
        return;
      }

      regularMatches.push(match);
    });

    return [...Array.from(confirmedByOffer.values()), ...regularMatches].sort((a, b) => b.score - a.score);
  }, [acceptedProposalsByOffer, matchesQuery.data, negotiatedOfferIds, ownedPreferenceIds, preferencesById, preferencesQuery.data]);

  const confirmedOfferIds = useMemo(() => new Set(Array.from(acceptedProposalsByOffer.keys())), [acceptedProposalsByOffer]);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const preferences = preferencesQuery.data ?? [];

      if (preferences.length === 0) {
        throw new Error("Cadastre uma preferência antes de gerar matches.");
      }

      const results = await Promise.all(preferences.map((preference) => generateMatches({ preferenceId: preference.id, minScore: 70 })));
      return results.flat();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["matches"] });
      toast.success("Matches atualizados com base nos seus interesses.");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const removeMutation = useMutation({
    mutationFn: deleteMatch,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["matches"] });
      toast.success("Match removido da sua lista.");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const isLoading = matchesQuery.isLoading || preferencesQuery.isLoading || proposalsQuery.isLoading;
  const error = matchesQuery.error ?? preferencesQuery.error ?? proposalsQuery.error;

  return (
    <div>
      <PageHeader
        eyebrow="Imóveis compatíveis"
        title="Matches para o seu perfil"
        description="Veja imóveis que combinam com as preferências que você cadastrou."
        action={
          <Button type="button" variant="secondary" loading={generateMutation.isPending} onClick={() => generateMutation.mutate()}>
            <RefreshCcw className="size-4" />
            Gerar novamente
          </Button>
        }
      />

      {isLoading ? <LoadingState message="Buscando seus imóveis compatíveis..." /> : null}
      {error ? <ErrorState message={getApiErrorMessage(error)} onRetry={() => void matchesQuery.refetch()} /> : null}

      {!isLoading && !error && preferencesQuery.data?.length === 0 ? (
        <EmptyState
          title="Cadastre uma preferência primeiro"
          description="Informe localização, orçamento e características para receber imóveis compatíveis."
          action={<Button type="button" onClick={() => window.location.assign("/onboarding/preferences")}>Cadastrar preferência</Button>}
        />
      ) : null}

      {!isLoading && !error && visibleMatches.length === 0 && preferencesQuery.data && preferencesQuery.data.length > 0 ? (
        <EmptyState
          title="Nenhum imóvel compatível ainda"
          description="Gere novamente ou ajuste sua preferência para ampliar as possibilidades."
          action={<Button type="button" onClick={() => generateMutation.mutate()} loading={generateMutation.isPending}>Gerar matches</Button>}
        />
      ) : null}

      {visibleMatches.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleMatches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              confirmed={confirmedOfferIds.has(match.offerId)}
              onRemove={confirmedOfferIds.has(match.offerId) ? (matchId) => removeMutation.mutate(matchId) : undefined}
              removing={removeMutation.isPending}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
