import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Building2, CheckCircle2, Plus } from "lucide-react";
import { Button } from "@/shared/components/Button";
import { EmptyState, ErrorState, LoadingState } from "@/shared/components/StateBlocks";
import { PageHeader } from "@/shared/components/PageHeader";
import { useAuth } from "@/modules/auth/components/AuthProvider";
import { getApiErrorMessage } from "@/shared/api/httpClient";
import { getReceivedProposals } from "@/modules/proposals/api/proposalsApi";
import { getNegotiatedOfferIds, syncAcceptedProposalsAsNegotiated } from "@/shared/utils/negotiationStorage";
import { OfferCard } from "../components/OfferCard";
import { getOffers } from "../api/offersApi";
import { OfferCreatePage } from "./OfferCreatePage";

export function AdvertiserPage() {
  const { user, profileMode, canUseSeller, activateSellerMode, setProfileMode } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [negotiatedOfferIds, setNegotiatedOfferIds] = useState(() => getNegotiatedOfferIds());

  const offersQuery = useQuery({
    queryKey: ["offers", "seller", user?.id],
    queryFn: () => getOffers(),
    enabled: profileMode === "seller" && canUseSeller,
  });


  const receivedProposalsQuery = useQuery({
    queryKey: ["proposals", "received", "seller-offers", user?.id],
    queryFn: getReceivedProposals,
    enabled: profileMode === "seller" && canUseSeller,
  });

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
    syncAcceptedProposalsAsNegotiated(receivedProposalsQuery.data);
    setNegotiatedOfferIds(getNegotiatedOfferIds());
  }, [receivedProposalsQuery.data]);

  const myOffers = useMemo(() => {
    return (offersQuery.data ?? []).filter((offer) => {
      if (!user?.id) return false;
      return offer.userId === user.id || offer.user?.id === user.id;
    });
  }, [offersQuery.data, user?.id]);

  function startSellerMode() {
    activateSellerMode();
    setProfileMode("seller");
    setShowCreateForm(false);
  }

  if (profileMode === "seller" && canUseSeller) {
    if (showCreateForm) {
      return (
        <div>
          <PageHeader
            eyebrow="Área de vendedor"
            title="Cadastrar imóvel"
            description="Preencha os dados da oferta e publique para receber interessados."
          />
          <OfferCreatePage embedded onCreated={() => setShowCreateForm(false)} onCancel={() => setShowCreateForm(false)} />
        </div>
      );
    }

    return (
      <div>
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <PageHeader
            eyebrow="Área de vendedor"
            title="Ofertas cadastradas"
            description="Gerencie os imóveis publicados pela sua conta."
          />
          <Button type="button" onClick={() => setShowCreateForm(true)}>
            <Plus className="size-4" />
            Cadastrar nova oferta
          </Button>
        </div>

        {offersQuery.isLoading ? <LoadingState message="Carregando ofertas..." /> : null}
        {offersQuery.isError ? <ErrorState message={getApiErrorMessage(offersQuery.error)} onRetry={() => void offersQuery.refetch()} /> : null}

        {offersQuery.isSuccess && myOffers.length === 0 ? (
          <EmptyState
            title="Nenhuma oferta cadastrada"
            description="Cadastre o primeiro imóvel para receber interessados e propostas."
            action={<Button type="button" onClick={() => setShowCreateForm(true)}><Plus className="size-4" /> Cadastrar nova oferta</Button>}
          />
        ) : null}

        {myOffers.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {myOffers.map((offer) => <OfferCard key={offer.id} offer={offer} negotiation={negotiatedOfferIds.has(offer.id) || Boolean(offer.status && offer.status !== "ATIVA")} />)}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Área de vendedor"
        title="Quer anunciar imóveis também?"
        description="Ative o perfil de vendedor para cadastrar ofertas e receber interessados."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-[2rem] border border-border bg-card p-6 shadow-card">
          <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Building2 className="size-7" />
          </div>
          <h2 className="mt-6 text-3xl font-black text-foreground">Ative sua área de vendedor</h2>
          <p className="mt-3 max-w-2xl text-base leading-8 text-muted-foreground">
            Use o mesmo acesso para alternar entre busca de imóveis e cadastro de ofertas.
          </p>

          <div className="mt-6 grid gap-3 text-sm font-bold text-muted-foreground sm:grid-cols-3">
            {["Cadastrar imóveis", "Receber interessados", "Acompanhar propostas"].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-2xl bg-secondary p-3">
                <CheckCircle2 className="size-4 text-primary" />
                {item}
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button type="button" onClick={startSellerMode}>
              Ativar perfil vendedor
              <ArrowRight className="size-4" />
            </Button>
            <Button type="button" variant="secondary" onClick={() => window.location.assign("/discover")}>Continuar descobrindo imóveis</Button>
          </div>
        </section>

        <aside className="rounded-[2rem] border border-border bg-gradient-primary p-6 text-primary-foreground shadow-card">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/75">Comprador + vendedor</p>
          <h3 className="mt-3 text-2xl font-black">Perfis separados, mesmo acesso.</h3>
          <p className="mt-3 text-sm leading-6 text-white/80">
            Alterne entre comprar e vender pelo menu lateral sempre que precisar.
          </p>
        </aside>
      </div>
    </div>
  );
}
