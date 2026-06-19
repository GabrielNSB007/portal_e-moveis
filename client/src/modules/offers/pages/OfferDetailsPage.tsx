import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "react-router-dom";
import { Bath, BedDouble, Car, CheckCircle2, LockKeyhole, Mail, MapPin, Phone, Ruler, Send } from "lucide-react";
import { Button } from "@/shared/components/Button";
import { ErrorState, LoadingState } from "@/shared/components/StateBlocks";
import { AMENITY_LABEL, PROPERTY_TYPE_LABEL } from "@/shared/constants/enums";
import { getApiErrorMessage } from "@/shared/api/httpClient";
import { formatCurrency, formatNumber } from "@/shared/utils/format";
import { getNegotiatedOfferIds, syncAcceptedProposalsAsNegotiated } from "@/shared/utils/negotiationStorage";
import { ProposalFormDialog } from "@/modules/proposals/pages/ProposalFormDialog";
import { getMyProposals } from "@/modules/proposals/api/proposalsApi";
import { useAuth } from "@/modules/auth/components/AuthProvider";
import { getOffer } from "../api/offersApi";

export function OfferDetailsPage() {
  const { user } = useAuth();
  const { offerId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [contactOpen, setContactOpen] = useState(false);
  const [negotiatedOfferIds, setNegotiatedOfferIds] = useState(() => getNegotiatedOfferIds());
  const offerQuery = useQuery({ queryKey: ["offers", offerId], queryFn: () => getOffer(offerId ?? ""), enabled: Boolean(offerId) });
  const proposalsQuery = useQuery({ queryKey: ["proposals", "sent", "offer-details"], queryFn: getMyProposals });

  const shouldOpenContact = searchParams.get("contact") === "true";

  const acceptedProposal = useMemo(() => {
    return (proposalsQuery.data ?? []).find((proposal) => proposal.offerId === offerId && proposal.status === "ACEITA");
  }, [offerId, proposalsQuery.data]);

  const pendingProposal = useMemo(() => {
    return (proposalsQuery.data ?? []).find((proposal) => proposal.offerId === offerId && proposal.status === "PENDENTE");
  }, [offerId, proposalsQuery.data]);

  useEffect(() => {
    if (shouldOpenContact && !acceptedProposal && !pendingProposal) setContactOpen(true);
  }, [acceptedProposal, pendingProposal, shouldOpenContact]);


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

  const gallery = useMemo(() => offerQuery.data?.media?.filter((item) => item.type === "FOTO") ?? [], [offerQuery.data?.media]);

  function closeContact() {
    setContactOpen(false);
    setSearchParams({});
  }

  if (offerQuery.isLoading) return <LoadingState message="Carregando imóvel..." />;
  if (offerQuery.isError) return <ErrorState message={getApiErrorMessage(offerQuery.error)} onRetry={() => void offerQuery.refetch()} />;
  if (!offerQuery.data) return <ErrorState message="Imóvel não encontrado." />;

  const offer = offerQuery.data;
  const isOwnOffer = Boolean(user?.id && (offer.userId === user.id || offer.user?.id === user.id));
  const offerUnavailable = negotiatedOfferIds.has(offer.id) || Boolean(offer.status && offer.status !== "ATIVA");
  const canSeeUnavailableOffer = isOwnOffer || Boolean(acceptedProposal);

  if (offerUnavailable && !canSeeUnavailableOffer) {
    return (
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-border bg-card p-8 text-center shadow-card">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-success/10 text-success">
          <LockKeyhole className="size-7" />
        </span>
        <p className="mt-5 text-sm font-bold uppercase tracking-[0.22em] text-success">Em negociação</p>
        <h1 className="mt-3 text-3xl font-black text-foreground">Este imóvel já está em negociação</h1>
        <p className="mt-3 text-muted-foreground">Os detalhes ficam indisponíveis enquanto existe uma negociação aceita pelo vendedor.</p>
        <Button type="button" className="mt-6" onClick={() => window.location.assign("/discover")}>Voltar para descobrir</Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <section className="grid gap-6">
        <div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-card">
          {gallery[0] ? (
            <img src={gallery[0].url} alt={offer.title} className="h-[380px] w-full object-cover" />
          ) : (
            <div className="grid h-[320px] place-items-center bg-gradient-hero font-bold text-muted-foreground">Sem imagem cadastrada</div>
          )}
        </div>

        <div className="rounded-[2rem] border border-border bg-card p-6 shadow-card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-primary">{PROPERTY_TYPE_LABEL[offer.propertyType]}</p>
              <h1 className="mt-2 text-3xl font-extrabold text-foreground sm:text-4xl">{offer.title}</h1>
            </div>
            {acceptedProposal ? <span className="rounded-full bg-success/10 px-3 py-1 text-sm font-black text-success">Em negociação</span> : null}
          </div>
          <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <MapPin className="size-4" />
            {offer.address ? `${offer.address} · ` : null}{offer.neighborhood}, {offer.city}/{offer.state}
          </p>
          <p className="mt-6 text-4xl font-extrabold text-foreground">{formatCurrency(offer.price)}</p>

          <div className="mt-6 grid gap-3 rounded-3xl bg-secondary/60 p-4 sm:grid-cols-4">
            <Info icon={<Ruler className="size-5" />} label="Área" value={formatNumber(offer.areaM2, " m²")} />
            <Info icon={<BedDouble className="size-5" />} label="Quartos" value={String(offer.bedrooms)} />
            <Info icon={<Bath className="size-5" />} label="Banheiros" value={String(offer.bathrooms)} />
            <Info icon={<Car className="size-5" />} label="Vagas" value={String(offer.parkingSpots)} />
          </div>

          {offer.description ? <p className="mt-6 text-base leading-8 text-muted-foreground">{offer.description}</p> : null}
        </div>

        <div className="rounded-[2rem] border border-border bg-card p-6 shadow-card">
          <h2 className="text-2xl font-extrabold text-foreground">Comodidades</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {offer.amenities.length > 0 ? offer.amenities.map((amenity) => (
              <span key={amenity} className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">{AMENITY_LABEL[amenity]}</span>
            )) : <span className="text-sm text-muted-foreground">Nenhuma comodidade informada.</span>}
          </div>
        </div>
      </section>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-[2rem] border border-border bg-card p-6 shadow-card">
          {acceptedProposal ? (
            <>
              <div className="inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-sm font-black text-success">
                <CheckCircle2 className="size-4" />
                Contato confirmado
              </div>
              <h2 className="mt-4 text-2xl font-extrabold text-foreground">Vendedor disponível</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">O vendedor aceitou seu interesse. Use os dados abaixo para continuar a negociação.</p>
              {offer.user ? (
                <div className="mt-5 grid gap-3 rounded-2xl bg-secondary/60 p-4 text-sm">
                  <p className="font-bold text-foreground">{offer.user.name}</p>
                  {offer.user.phone ? <p className="flex items-center gap-2 text-muted-foreground"><Phone className="size-4" />{offer.user.phone}</p> : null}
                  {offer.user.email ? <p className="flex items-center gap-2 text-muted-foreground"><Mail className="size-4" />{offer.user.email}</p> : null}
                </div>
              ) : null}
            </>
          ) : pendingProposal ? (
            <>
              <h2 className="text-2xl font-extrabold text-foreground">Interesse enviado</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Sua proposta está aguardando resposta do vendedor.</p>
              <Button className="mt-5 w-full" type="button" size="lg" disabled>Proposta pendente</Button>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-extrabold text-foreground">Gostou desse imóvel?</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Envie uma mensagem ou proposta para iniciar contato com o vendedor.</p>
              <Button className="mt-5 w-full" type="button" size="lg" onClick={() => setContactOpen(true)}>
                <Send className="size-4" />
                Entrar em contato
              </Button>
            </>
          )}
        </div>
      </aside>

      {contactOpen ? <ProposalFormDialog offerId={offer.id} offerTitle={offer.title} onClose={closeContact} /> : null}
    </div>
  );
}

function Info({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card p-3">
      <div className="flex items-center gap-2 text-primary">{icon}<span className="text-xs font-bold uppercase tracking-wide">{label}</span></div>
      <p className="mt-2 text-lg font-extrabold text-foreground">{value}</p>
    </div>
  );
}
