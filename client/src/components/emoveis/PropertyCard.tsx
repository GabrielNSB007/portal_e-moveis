import { Link } from "@tanstack/react-router";
import { Bath, BedDouble, Bookmark, Car, Handshake, Maximize, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import type { MouseEvent } from "react";
import { fmtCurrency } from "@/mock/data";
import type { Property } from "@/mock/data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { MatchBadge } from "./MatchBadge";

type Variant = "feed" | "compact" | "list" | "hero";

export function PropertyCard({
  property,
  variant = "feed",
  compact = false,
}: {
  property: Property;
  variant?: Variant;
  compact?: boolean;
}) {
  const [saved, setSaved] = useState(false);
  const [interested, setInterested] = useState(false);

  const toggleSave = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved((s) => !s);
  };

  const registerInterest = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setInterested(true);
    toast.success("Interesse enviado ao anunciante.");
  };

  const v: Variant = compact ? "compact" : variant;

  if (v === "list") {
    return (
      <div className="flex gap-3 rounded-2xl bg-card p-2.5 shadow-soft transition active:scale-[0.99]">
        <Link to="/property/$id" params={{ id: property.id }} className="flex min-w-0 flex-1 gap-3">
          <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-xl">
            <img src={property.images[0]} alt={property.title} className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0 flex-1 py-0.5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-1 text-sm font-semibold">{property.title}</h3>
              <MatchBadge value={property.match} variant="soft" className="shrink-0 text-[10px]" />
            </div>
            <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
              <MapPin className="h-3 w-3" /> {property.neighborhood}
            </div>
            <div className="mt-1.5 flex items-center gap-2.5 text-[11px] text-muted-foreground">
              <Spec icon={BedDouble} value={property.bedrooms} />
              <Spec icon={Bath} value={property.bathrooms} />
              <Spec icon={Maximize} value={`${property.area}m2`} />
            </div>
            <div className="mt-1 text-sm font-bold text-foreground">{fmtCurrency(property.price)}</div>
          </div>
        </Link>
        <button
          onClick={registerInterest}
          className={cn(
            "self-end shrink-0 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold transition active:scale-95",
            interested ? "bg-success/15 text-success" : "bg-primary text-primary-foreground shadow-soft",
          )}
        >
          {interested ? "Interesse enviado" : "Tenho interesse"}
        </button>
      </div>
    );
  }

  return (
    <motion.article
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        "group overflow-hidden rounded-3xl bg-card shadow-card transition",
        v === "compact" && "shadow-soft",
        v === "hero" && "lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]",
      )}
    >
      <Link to="/property/$id" params={{ id: property.id }} className={cn("block min-w-0", v === "hero" && "contents")}>
        <div
          className={cn(
            "relative overflow-hidden",
            v === "compact" ? "aspect-[4/3]" : "aspect-[5/4]",
            v === "hero" && "lg:aspect-auto lg:min-h-[360px]",
          )}
        >
          <img
            src={property.images[0]}
            alt={property.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute left-3 top-3">
            <MatchBadge value={property.match} />
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white">
            <div className="text-lg font-bold leading-tight">{fmtCurrency(property.price)}</div>
            <div className="text-xs opacity-90">
              {property.type} - {property.neighborhood}
            </div>
          </div>
        </div>
      </Link>

      <div className={cn("p-3.5", v === "hero" && "lg:flex lg:flex-col lg:justify-between lg:p-6")}>
        <div>
          <div className="flex items-start gap-2">
            <Link to="/property/$id" params={{ id: property.id }} className="min-w-0 flex-1">
              <h3 className={cn("line-clamp-1 text-sm font-semibold", v === "hero" && "lg:text-xl")}>
                {property.title}
              </h3>
              <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">
                  {property.neighborhood}, {property.city}
                </span>
              </div>
            </Link>
            <button
              onClick={toggleSave}
              aria-label="Salvar"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-foreground transition active:scale-95"
            >
              <Bookmark className={cn("h-4 w-4", saved && "fill-primary text-primary")} />
            </button>
          </div>

          {v !== "compact" && (
            <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
              <Spec icon={BedDouble} value={`${property.bedrooms} quartos`} />
              <Spec icon={Bath} value={property.bathrooms} />
              <Spec icon={Maximize} value={`${property.area}m2`} />
              {property.parking > 0 && <Spec icon={Car} value={property.parking} />}
            </div>
          )}

          {v === "hero" && (
            <p className="mt-4 hidden text-sm leading-relaxed text-muted-foreground lg:block">{property.reason}</p>
          )}
        </div>

        {v !== "compact" && (
          <button
            onClick={registerInterest}
            className={cn(
              "mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition active:scale-[0.98]",
              interested ? "bg-success/15 text-success" : "bg-primary text-primary-foreground shadow-soft",
            )}
          >
            <Handshake className="h-4 w-4" />
            {interested ? "Interesse enviado" : "Tenho interesse"}
          </button>
        )}
      </div>
    </motion.article>
  );
}

function Spec({ icon: Icon, value }: { icon: typeof BedDouble; value: string | number }) {
  return (
    <span className="flex min-w-0 items-center gap-1">
      <Icon className="h-3 w-3 shrink-0" />
      <span className="truncate">{value}</span>
    </span>
  );
}
