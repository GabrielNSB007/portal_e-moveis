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
  Grid3X3,
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
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center text-muted-foreground">
        <p className="mb-4 text-lg">Imóvel não encontrado.</p>
        <Link to="/explore">
          <Button variant="outline">Voltar para Explorar</Button>
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
    toast.success("Interesse enviado ao anunciante!");
  };

  const ctaButton = matched ? (
    <Button
      onClick={() => toast.success(`Abrindo WhatsApp de ${p.contact.agent}.`)}
      className="h-12 flex-1 rounded-2xl bg-success text-base font-semibold text-success-foreground shadow-float transition-transform active:scale-95 lg:h-14 lg:text-lg"
    >
      <Send className="mr-2 h-5 w-5" />
      Falar no WhatsApp
    </Button>
  ) : interested ? (
    <Button
      disabled
      className="h-12 flex-1 rounded-2xl bg-success text-base font-semibold text-success-foreground lg:h-14 lg:text-lg"
    >
      <Check className="mr-2 h-5 w-5" />
      Interesse enviado
    </Button>
  ) : (
    <Button
      onClick={sendInterest}
      className="h-12 flex-1 rounded-2xl bg-gradient-primary text-base font-semibold shadow-float transition-transform active:scale-95 lg:h-14 lg:text-lg"
    >
      <Sparkles className="mr-2 h-5 w-5" />
      Tenho interesse
    </Button>
  );

  const specs = [
    { icon: BedDouble, label: "Quartos", value: p.bedrooms },
    { icon: Bath, label: "Banheiros", value: p.bathrooms },
    { icon: Maximize, label: "Área", value: `${p.area}m²` },
    { icon: Car, label: "Vagas", value: p.parking },
  ];

  return (
    /* WRAPPER EXTERNO: 100% de largura pintando o fundo por igual */
    <div className="min-h-dvh w-full bg-background text-foreground">
      
      {/* WRAPPER INTERNO: Centraliza o conteúdo e limita em 1200px */}
      <div className="mx-auto pb-28 lg:max-w-[1200px] lg:px-8 lg:py-8 lg:pb-8">
        
        {/* HEADER DESKTOP: Título acima das fotos */}
        <div className="hidden lg:mb-6 lg:block">
          <div className="flex items-center justify-between">
            <button
              onClick={goBack}
              className="group flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Voltar para a busca
            </button>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-sm font-semibold transition hover:bg-secondary/80">
                <Share2 className="h-4 w-4" /> Compartilhar
              </button>
              <button
                onClick={toggleFav}
                className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-sm font-semibold transition hover:bg-secondary/80"
              >
                <Bookmark className={fav ? "h-4 w-4 fill-primary text-primary" : "h-4 w-4"} />
                {fav ? "Salvo" : "Salvar"}
              </button>
            </div>
          </div>

          <div className="mt-6 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {p.type}
                </span>
                <MatchBadge value={p.match} variant="soft" />
              </div>
              <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-foreground xl:text-4xl">{p.title}</h1>
              <div className="mt-2 flex items-center gap-1.5 text-base text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {p.neighborhood}, {p.city}
              </div>
            </div>
          </div>
        </div>

        {/* GALERIA MOBILE: Slider clássico */}
        <div className="relative lg:hidden">
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
            <img src={p.images[photo]} alt={p.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" />
          </div>

          {/* Header Flutuante Mobile */}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 safe-top">
            <button
              onClick={goBack}
              className="grid h-10 w-10 place-items-center rounded-full bg-white/30 text-white backdrop-blur-md transition-transform active:scale-90"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-2">
              <button className="grid h-10 w-10 place-items-center rounded-full bg-white/30 text-white backdrop-blur-md transition-transform active:scale-90">
                <Share2 className="h-5 w-5" />
              </button>
              <button
                onClick={toggleFav}
                className="grid h-10 w-10 place-items-center rounded-full bg-white/30 text-white backdrop-blur-md transition-transform active:scale-90"
              >
                <Bookmark className={fav ? "h-5 w-5 fill-white text-white" : "h-5 w-5"} />
              </button>
            </div>
          </div>

          {/* Indicadores do Slider Mobile */}
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5">
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
        </div>

        {/* GALERIA DESKTOP: Estilo Airbnb */}
        <div className="relative hidden lg:grid lg:h-[420px] lg:grid-cols-[2fr_1fr_1fr] lg:gap-2 xl:h-[500px]">
          <div className="relative h-full w-full overflow-hidden rounded-l-3xl group">
            <img src={p.images[0]} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="relative h-full w-full overflow-hidden group">
              <img src={p.images[1]} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div className="relative h-full w-full overflow-hidden group">
              <img src={p.images[2]} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="relative h-full w-full overflow-hidden rounded-tr-3xl group">
              <img src={p.images[3]} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div className="relative h-full w-full overflow-hidden rounded-br-3xl group">
              <img src={p.images[4] || p.images[0]} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
          </div>
          <Button variant="secondary" className="absolute bottom-4 right-4 flex gap-2 font-semibold shadow-lg">
            <Grid3X3 className="h-4 w-4" /> Mostrar todas as fotos
          </Button>
        </div>

        {/* CONTEÚDO: 2 Colunas no Desktop */}
        <div className="lg:mt-8 lg:grid lg:grid-cols-[1fr_380px] lg:items-start lg:gap-8 xl:grid-cols-[1fr_420px]">
          <main className="px-5 pt-5 lg:px-0 lg:pt-0">
            
            {/* Título Mobile (Oculto no Desktop) */}
            <div className="lg:hidden">
              <div className="flex items-start justify-between gap-3">
                <MatchBadge value={p.match} variant="soft" />
                <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium uppercase text-muted-foreground">
                  {p.type}
                </span>
              </div>
              <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight">{p.title}</h1>
              <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {p.neighborhood}, {p.city}
              </div>
              <div className="mt-4 text-3xl font-bold">{fmtCurrency(p.price)}</div>
            </div>

            <div className="mt-6 grid grid-cols-4 gap-2 lg:mt-0 lg:gap-4">
              {specs.map((spec) => (
                <div key={spec.label} className="rounded-2xl border border-transparent bg-card p-3 text-center shadow-soft transition-colors hover:border-border lg:p-4">
                  <spec.icon className="mx-auto h-[20px] w-[20px] text-primary lg:h-[24px] lg:w-[24px]" />
                  <div className="mt-2 text-base font-bold lg:text-lg">{spec.value}</div>
                  <div className="text-[10px] uppercase text-muted-foreground lg:text-xs">{spec.label}</div>
                </div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-7 rounded-3xl border border-primary/20 bg-primary/5 p-5 lg:p-6"
            >
              <div className="flex items-center gap-2 text-base font-bold text-primary lg:text-lg">
                <Sparkles className="h-5 w-5" />
                Por que combina com você
              </div>
              <p className="mt-2 text-sm leading-relaxed text-foreground/80 lg:text-base">{p.reason}</p>
            </motion.div>

            <section className="mt-7 border-t border-border pt-7">
              <h3 className="text-lg font-bold lg:text-xl">Sobre o imóvel</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground lg:text-base">{p.description}</p>
            </section>

            <section className="mt-7 border-t border-border pt-7">
              <h3 className="text-lg font-bold lg:text-xl">Diferenciais</h3>
              <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
                {p.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm transition hover:shadow-md">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                      <Check className="h-4 w-4" />
                    </div>
                    <span className="min-w-0 truncate text-sm font-medium">{amenity}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-7 border-t border-border pt-7">
              <h3 className="text-lg font-bold lg:text-xl">Por perto</h3>
              <ul className="mt-4 divide-y divide-border rounded-2xl border border-border bg-card shadow-sm">
                {p.nearby.map((nearby) => (
                  <li key={nearby.name} className="flex items-center justify-between gap-3 px-5 py-4">
                    <span className="min-w-0 truncate font-medium text-foreground">{nearby.name}</span>
                    <span className="shrink-0 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">{nearby.distance}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-7 border-t border-border pt-7 lg:hidden">
              <h3 className="text-lg font-bold">Contato do anunciante</h3>
              {matched ? (
                <div className="mt-4 overflow-hidden rounded-3xl border border-success/30 bg-success/5 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-success/20 bg-success/10 px-5 py-3 text-sm font-semibold text-success">
                    <ShieldCheck className="h-4 w-4" />
                    Contato liberado pelo match mútuo
                  </div>
                  <div className="space-y-1 p-4">
                    <ContactItem icon={Send} label="WhatsApp" value={p.contact.whatsapp} />
                    <ContactItem icon={Phone} label="Telefone" value={p.contact.phone} />
                    <ContactItem icon={Mail} label="Email" value={p.contact.email} />
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex items-start gap-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground">
                    <Lock className="h-6 w-6" />
                  </div>
                  <div className="text-sm leading-relaxed text-muted-foreground">
                    Os dados de contato serão liberados automaticamente após o{" "}
                    <strong className="text-foreground">match mútuo</strong>. Isso protege sua privacidade e evita spam.
                  </div>
                </div>
              )}
            </section>

          </main>

          {/* SIDEBAR DESKTOP: Card Sticky */}
          <aside className="sticky top-8 hidden lg:block">
            <div className="rounded-[2rem] border border-border bg-card p-6 shadow-2xl">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Valor do Investimento
              </div>
              <div className="mt-2 text-4xl font-bold text-foreground">{fmtCurrency(p.price)}</div>
              
              <div className="mt-6 flex flex-col gap-3">
                {ctaButton}
              </div>

              <div className="mt-6 space-y-4 rounded-2xl bg-secondary/50 p-5">
                <h3 className="text-sm font-bold">Resumo Financeiro</h3>
                <div className="space-y-3">
                  <SummaryRow label="Condomínio" value="R$ 850" />
                  <SummaryRow label="IPTU" value="R$ 2.400 / ano" />
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-bold">Contato do anunciante</h3>
                {matched ? (
                  <div className="mt-3 overflow-hidden rounded-2xl border border-success/30 bg-success/5">
                    <div className="flex items-center gap-2 border-b border-success/20 bg-success/10 px-4 py-2 text-xs font-bold text-success">
                      <ShieldCheck className="h-4 w-4" />
                      Liberado pelo match mútuo
                    </div>
                    <div className="space-y-1 p-3">
                      <ContactItem icon={Send} label="WhatsApp" value={p.contact.whatsapp} />
                      <ContactItem icon={Phone} label="Telefone" value={p.contact.phone} />
                      <ContactItem icon={Mail} label="Email" value={p.contact.email} />
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 flex items-start gap-3 rounded-2xl border border-border bg-background p-4 shadow-inner">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground">
                      <Lock className="h-5 w-5" />
                    </div>
                    <div className="text-xs leading-relaxed text-muted-foreground">
                      Os contatos serão liberados após o <strong className="text-foreground">match mútuo</strong>.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>

        <section className="mt-8 px-5 lg:px-0">
          <h3 className="text-lg font-bold lg:text-xl">Localização</h3>
          <div className="relative mt-4 h-64 overflow-hidden rounded-3xl border border-border bg-secondary shadow-sm lg:h-80">
            <div
              className="absolute inset-0 opacity-60"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 30% 40%, oklch(0.55 0.14 175 / 0.18) 0, transparent 50%), radial-gradient(circle at 70% 60%, oklch(0.72 0.17 175 / 0.18) 0, transparent 50%), linear-gradient(135deg, oklch(0.92 0.02 175), oklch(0.96 0.01 200))",
              }}
            />
            <svg className="absolute inset-0 h-full w-full opacity-40">
              <defs>
                <pattern id="grid-full" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-full)" />
            </svg>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="grid h-16 w-16 animate-pulse place-items-center rounded-full bg-gradient-primary shadow-float">
                <MapPin className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 px-5 lg:px-0">
          <h2 className="text-xl font-bold lg:text-2xl">Imóveis similares</h2>
          <div className="mt-4 flex gap-4 overflow-x-auto pb-3 no-scrollbar lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0">
            {similar.map((item) => (
              <div key={item.id} className="w-[260px] shrink-0 lg:w-auto">
                <PropertyCard property={item} compact />
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER MOBILE: Mantido como estava */}
        <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-2xl border-t border-border bg-background/95 px-4 py-3 backdrop-blur-xl safe-bottom lg:hidden">
          <div className="flex gap-2">
            <button
              onClick={toggleFav}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-border bg-card transition active:scale-95"
              aria-label="Salvar"
            >
              <Bookmark className={fav ? "h-5 w-5 fill-primary text-primary" : "h-5 w-5"} />
            </button>
            {ctaButton}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border/50 pb-2 last:border-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
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
    <div className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/50">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-background text-primary shadow-sm">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="truncate text-sm font-semibold">{value}</div>
      </div>
    </div>
  );
}
