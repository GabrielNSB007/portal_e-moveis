import { Bath, BedDouble, Car, MapPin, Ruler, Send } from "lucide-react";
import { Button } from "@/shared/components/Button";
import { PROPERTY_TYPE_LABEL } from "@/shared/constants/enums";
import type { Offer } from "@/shared/types/domain";
import { formatCurrency, formatNumber } from "@/shared/utils/format";

type OfferCardProps = {
  offer: Offer;
  onContact?: (offer: Offer) => void;
  negotiation?: boolean;
};

function isUnavailable(offer: Offer, negotiation: boolean) {
  return negotiation || Boolean(offer.status && offer.status !== "ATIVA");
}

function statusLabel(offer: Offer, unavailable: boolean) {
  if (unavailable) return "Em negociação";
  return offer.status ?? "ATIVA";
}

export function OfferCard({ offer, onContact, negotiation = false }: OfferCardProps) {
  const coverImage = offer.media?.find((item) => item.type === "FOTO")?.url ?? offer.media?.[0]?.url;
  const unavailable = isUnavailable(offer, negotiation);

  function goToDetails() {
    if (unavailable) return;
    window.location.assign(`/offers/${offer.id}`);
  }

  return (
    <article className="overflow-hidden rounded-[1.7rem] border border-border bg-card shadow-card transition hover:-translate-y-1 hover:border-primary/30">
      <button type="button" className="block w-full text-left disabled:cursor-not-allowed" onClick={goToDetails} disabled={unavailable}>
        <div className="relative h-48 bg-secondary">
          {coverImage ? (
            <img src={coverImage} alt={offer.title} className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center bg-gradient-hero text-sm font-bold text-muted-foreground">Sem imagem</div>
          )}
          <span className={unavailable ? "absolute left-4 top-4 rounded-full bg-success/15 px-3 py-1 text-xs font-black text-success shadow-sm" : "absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-foreground shadow-sm"}>
            {statusLabel(offer, unavailable)}
          </span>
        </div>
      </button>

      <div className="grid gap-4 p-5">
        <div>
          <p className="text-sm font-bold text-primary">{PROPERTY_TYPE_LABEL[offer.propertyType]}</p>
          <h2 className="mt-1 line-clamp-2 text-xl font-extrabold text-foreground">{offer.title}</h2>
          <p className="mt-2 flex items-center gap-1 text-sm font-medium text-muted-foreground">
            <MapPin className="size-4" />
            {offer.neighborhood}, {offer.city}/{offer.state}
          </p>
        </div>

        <p className="text-2xl font-extrabold text-foreground">{formatCurrency(offer.price)}</p>

        <div className="grid grid-cols-4 gap-2 rounded-2xl bg-secondary/60 p-3 text-xs font-bold text-muted-foreground">
          <span className="flex items-center gap-1"><Ruler className="size-4" />{formatNumber(offer.areaM2, "m²")}</span>
          <span className="flex items-center gap-1"><BedDouble className="size-4" />{offer.bedrooms}</span>
          <span className="flex items-center gap-1"><Bath className="size-4" />{offer.bathrooms}</span>
          <span className="flex items-center gap-1"><Car className="size-4" />{offer.parkingSpots}</span>
        </div>

        <div className={onContact ? "grid gap-2 sm:grid-cols-2" : "grid gap-2"}>
          <Button variant="secondary" type="button" onClick={goToDetails} disabled={unavailable}>
            {unavailable ? "Indisponível" : "Ver imóvel"}
          </Button>
          {onContact ? (
            <Button type="button" disabled={unavailable} onClick={() => onContact(offer)}>
              <Send className="size-4" />
              {unavailable ? "Em negociação" : "Enviar interesse"}
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
