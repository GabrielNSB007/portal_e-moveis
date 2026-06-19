import { Bath, BedDouble, Car, CheckCircle2, MapPin, Ruler, Send, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/Button";
import { ScoreBadge } from "@/shared/components/ScoreBadge";
import { PROPERTY_TYPE_LABEL } from "@/shared/constants/enums";
import type { Match } from "@/shared/types/domain";
import { formatCurrency, formatNumber } from "@/shared/utils/format";

type MatchCardProps = {
  match: Match;
  confirmed?: boolean;
  onRemove?: (matchId: string) => void;
  removing?: boolean;
};

export function MatchCard({ match, confirmed = false, onRemove, removing = false }: MatchCardProps) {
  const offer = match.offer;
  const coverImage = offer.media?.[0]?.url;
  const isConfirmed = confirmed || match.status === "FEITO";

  return (
    <article className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-card transition hover:-translate-y-1 hover:border-primary/30">
      <div className="relative h-56 bg-secondary">
        {coverImage ? (
          <img src={coverImage} alt={offer.title} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center bg-gradient-hero text-sm font-bold text-muted-foreground">Sem imagem</div>
        )}
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <ScoreBadge score={match.score} />
          {isConfirmed ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-sm font-extrabold text-success">
              <CheckCircle2 className="size-4" />
              Match confirmado
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 p-5">
        <div>
          <p className="text-sm font-bold text-primary">{PROPERTY_TYPE_LABEL[offer.propertyType]}</p>
          <h2 className="mt-1 line-clamp-2 text-xl font-extrabold text-foreground">{offer.title}</h2>
          {match.preference?.title ? (
            <p className="mt-2 rounded-2xl bg-primary/10 px-3 py-2 text-xs font-extrabold text-primary">
              Perfil de interesse: {match.preference.title}
            </p>
          ) : null}
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

        <div className="grid gap-2 sm:grid-cols-2">
          {isConfirmed && onRemove ? (
            <Button variant="secondary" type="button" loading={removing} onClick={() => onRemove(match.id)}>
              <Trash2 className="size-4" />
              Remover
            </Button>
          ) : (
            <Button variant="secondary" type="button" onClick={() => window.location.assign(`/offers/${offer.id}`)}>
              Ver imóvel
            </Button>
          )}
          <Button
            type="button"
            className={isConfirmed ? "bg-success text-white hover:bg-success/90" : undefined}
            onClick={() => window.location.assign(isConfirmed ? `/offers/${offer.id}` : `/offers/${offer.id}?contact=true`)}
          >
            {isConfirmed ? <CheckCircle2 className="size-4" /> : <Send className="size-4" />}
            {isConfirmed ? "Contato confirmado" : "Contato"}
          </Button>
        </div>
      </div>
    </article>
  );
}
