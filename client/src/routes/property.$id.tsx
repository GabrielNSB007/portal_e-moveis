import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Bookmark,
  Car,
  Check,
  Lock,
  Mail,
  MapPin,
  Maximize,
  Phone,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { propertyById, properties, fmtCurrency, isMatched } from "@/mock/data";
import { MatchBadge } from "@/components/emoveis/MatchBadge";
import { PropertyCard } from "@/components/emoveis/PropertyCard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/property/$id")({
  component: PropertyDetails,
});

function PropertyDetails() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const p = propertyById(id);
  const [fav, setFav] = useState(false);
  const [photo, setPhoto] = useState(0);
  const [interested, setInterested] = useState(false);

  if (!p) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Imovel nao encontrado.{" "}
        <Link to="/explore" className="text-primary">
          Explorar
        </Link>
      </div>
    );
  }

  const matched = isMatched(p.id);
  const similar = properties.filter((x) => x.id !== p.id).slice(0, 4);

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
      return;
    }

    navigate({ to: "/explore" });
  };

  const toggleFav = () => {
    setFav((value) => !value);
    toast.success(fav ? "Removido dos salvos" : "Salvo");
  };

  const sendInterest = () => {
    setInterested(true);
    toast.success("Interesse enviado ao anunciante");
  };

  const ctaButton = matched ? (
    <Button
      onClick={() => toast.success(`Abrindo WhatsApp de ${p.contact.agent}.`)}
      className="h-12 flex-1 rounded-2xl bg-success text-base font-semibold text-success-foreground shadow-float"
    >
      <Send className="mr-2 h-4 w-4" />
      Entrar em contato
    </Button>
  ) : interested ? (
    <Button
      disabled
      className="h-12 flex-1 rounded-2xl bg-success text-base font-semibold text-success-foreground"
    >
      <Check className="mr-2 h-4 w-4" />
      Interesse enviado
    </Button>
  ) : (
    <Button
      onClick={sendInterest}
      className="h-12 flex-1 rounded-2xl bg-gradient-primary text-base font-semibold shadow-float"
    >
      <Sparkles className="mr-2 h-4 w-4" />
      Tenho interesse
    </Button>
  );

  const specs = [
    { icon: BedDouble, label: "Quartos", value: p.bedrooms },
    { icon: Bath, label: "Banheiros", value: p.bathrooms },
    { icon: Maximize, label: "Area", value: `${p.area}m2` },
    { icon: Car, label: "Vagas", value: p.parking },
  ];

  return (
    <div className="mx-auto min-h-dvh bg-background pb-32 lg:max-w-[1440px] lg:px-8 lg:py-6 lg:pb-12">
      <div className="hidden lg:mb-5 lg:flex lg:items-center lg:justify-between">
        <button
          onClick={goBack}
          className="inline-flex h-10 items-center gap-2 rounded-2xl border border-border bg-card px-3 text-sm font-medium shadow-soft transition hover:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
        <div className="flex gap-2">
          <button className="grid h-10 w-10 place-items-center rounded-2xl border border-border bg-card shadow-soft">
            <Share2 className="h-4 w-4" />
          </button>
          <button
            onClick={toggleFav}
            className="grid h-10 w-10 place-items-center rounded-2xl border border-border bg-card shadow-soft"
          >
            <Bookmark className={fav ? "h-4 w-4 fill-primary text-primary" : "h-4 w-4"} />
          </button>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)_340px] lg:items-start lg:gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)_360px] xl:gap-8">
        <div className="relative lg:sticky lg:top-6 lg:h-fit">
          <div className="relative aspect-[4/3] overflow-hidden bg-secondary lg:rounded-3xl lg:shadow-card">
            <img src={p.images[photo]} alt={p.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent lg:hidden" />
          </div>

          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 safe-top lg:hidden">
            <button
              onClick={goBack}
              className="grid h-10 w-10 place-items-center rounded-full bg-white/25 text-white backdrop-blur-md"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-2">
              <button className="grid h-10 w-10 place-items-center rounded-full bg-white/25 text-white backdrop-blur-md">
                <Share2 className="h-5 w-5" />
              </button>
              <button
                onClick={toggleFav}
                className="grid h-10 w-10 place-items-center rounded-full bg-white/25 text-white backdrop-blur-md"
              >
                <Bookmark className={fav ? "h-5 w-5 fill-primary text-primary" : "h-5 w-5"} />
              </button>
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5 lg:hidden">
            {p.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setPhoto(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === photo ? "w-6 bg-white" : "w-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>

          <div className="mt-3 hidden grid-cols-4 gap-3 lg:grid">
            {p.images.slice(0, 4).map((image, index) => (
              <button
                key={image}
                onClick={() => setPhoto(index)}
                className={`aspect-[4/3] overflow-hidden rounded-2xl border transition ${
                  index === photo ? "border-primary shadow-soft" : "border-border opacity-80 hover:opacity-100"
                }`}
              >
                <img src={image} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <main className="px-5 pt-5 lg:px-0 lg:pt-0">
          <div className="flex items-start justify-between gap-3">
            <MatchBadge value={p.match} variant="soft" />
            <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              {p.type}
            </span>
          </div>

          <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight lg:text-3xl">{p.title}</h1>
          <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {p.neighborhood}, {p.city}
          </div>
          <div className="mt-4 text-3xl font-bold lg:hidden">{fmtCurrency(p.price)}</div>

          <div className="mt-5 grid grid-cols-4 gap-2 lg:gap-3">
            {specs.map((spec) => (
              <div key={spec.label} className="rounded-2xl bg-card p-3 text-center shadow-soft lg:border lg:border-border">
                <spec.icon className="mx-auto h-[18px] w-[18px] text-primary" />
                <div className="mt-1 text-base font-bold">{spec.value}</div>
                <div className="text-[10px] text-muted-foreground">{spec.label}</div>
              </div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 rounded-2xl border border-primary/30 bg-primary/5 p-4"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <Sparkles className="h-4 w-4" />
              Por que combina com voce
            </div>
            <p className="mt-1.5 text-sm leading-relaxed">{p.reason}</p>
          </motion.div>

          <section className="mt-6">
            <h3 className="text-sm font-semibold">Sobre o imovel</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
          </section>

          <section className="mt-6">
            <h3 className="text-sm font-semibold">Diferenciais</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {p.amenities.map((amenity) => (
                <div key={amenity} className="flex items-center gap-2 rounded-xl bg-card p-2.5 text-xs shadow-soft">
                  <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="min-w-0 truncate">{amenity}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-6">
            <h3 className="text-sm font-semibold">Por perto</h3>
            <ul className="mt-2 divide-y divide-border rounded-2xl bg-card shadow-soft">
              {p.nearby.map((nearby) => (
                <li key={nearby.name} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <span className="min-w-0 truncate">{nearby.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{nearby.distance}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6">
            <h3 className="text-sm font-semibold">Localizacao</h3>
            <div className="relative mt-2 h-48 overflow-hidden rounded-2xl bg-secondary shadow-soft">
              <div
                className="absolute inset-0 opacity-60"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 30% 40%, oklch(0.55 0.14 175 / 0.18) 0, transparent 50%), radial-gradient(circle at 70% 60%, oklch(0.72 0.17 175 / 0.18) 0, transparent 50%), linear-gradient(135deg, oklch(0.92 0.02 175), oklch(0.96 0.01 200))",
                }}
              />
              <svg className="absolute inset-0 h-full w-full opacity-40">
                <defs>
                  <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="grid h-12 w-12 animate-pulse place-items-center rounded-full bg-gradient-primary shadow-float">
                  <MapPin className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6">
            <h3 className="text-sm font-semibold">Contato do anunciante</h3>
            {matched ? (
              <div className="mt-2 overflow-hidden rounded-2xl border border-success/30 bg-success/5">
                <div className="flex items-center gap-2 border-b border-success/20 px-4 py-2.5 text-xs font-semibold text-success">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Contato liberado pelo match mutuo
                </div>
                <div className="space-y-1 p-3">
                  <ContactItem icon={Send} label="WhatsApp" value={p.contact.whatsapp} />
                  <ContactItem icon={Phone} label="Telefone" value={p.contact.phone} />
                  <ContactItem icon={Mail} label="Email" value={p.contact.email} />
                </div>
              </div>
            ) : (
              <div className="mt-2 flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </div>
                <div className="text-xs text-muted-foreground">
                  Os dados de contato serao liberados automaticamente apos o{" "}
                  <strong className="text-foreground">match mutuo</strong>. Isso protege sua privacidade e evita spam.
                </div>
              </div>
            )}
          </section>

          <section className="mt-8">
            <h2 className="text-sm font-semibold">Imoveis similares</h2>
            <div className="mt-3 flex gap-3 overflow-x-auto pb-4 no-scrollbar lg:grid lg:grid-cols-2 lg:overflow-visible lg:pb-0">
              {similar.map((item) => (
                <div key={item.id} className="w-52 shrink-0 lg:w-auto">
                  <PropertyCard property={item} compact />
                </div>
              ))}
            </div>
          </section>
        </main>

        <aside className="sticky top-6 hidden space-y-4 lg:block">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Preco do imovel
            </div>
            <div className="mt-1 text-3xl font-bold">{fmtCurrency(p.price)}</div>
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-primary/5 p-3">
              <span className="text-sm font-semibold text-primary">Compatibilidade</span>
              <MatchBadge value={p.match} variant="soft" />
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={toggleFav}
                className="grid h-12 w-12 place-items-center rounded-2xl border border-border bg-background transition hover:bg-secondary"
                aria-label="Salvar"
              >
                <Bookmark className={fav ? "h-5 w-5 fill-primary text-primary" : "h-5 w-5"} />
              </button>
              {ctaButton}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              O contato externo so e liberado depois de interesse mutuo.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
            <h3 className="text-sm font-semibold">Resumo</h3>
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              <SummaryRow label="Tipo" value={p.type} />
              <SummaryRow label="Bairro" value={p.neighborhood} />
              <SummaryRow label="Anunciante" value={p.contact.agent} />
            </div>
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-2xl border-t border-border bg-background/95 px-4 py-3 backdrop-blur-xl safe-bottom lg:hidden">
        <div className="flex gap-2">
          <button
            onClick={toggleFav}
            className="grid h-12 w-12 place-items-center rounded-2xl border border-border bg-card transition active:scale-95"
            aria-label="Salvar"
          >
            <Bookmark className={fav ? "h-5 w-5 fill-primary text-primary" : "h-5 w-5"} />
          </button>
          {ctaButton}
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span>{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

function ContactItem({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-2 py-2">
      <div className="grid h-9 w-9 place-items-center rounded-full bg-card text-primary shadow-soft">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="truncate text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}
