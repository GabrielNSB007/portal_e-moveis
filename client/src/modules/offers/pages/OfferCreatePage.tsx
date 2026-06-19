import { useState, type ChangeEvent, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Building2, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/Button";
import { ChipGroup } from "@/shared/components/ChipGroup";
import { Input, Select, Textarea } from "@/shared/components/Field";
import { PageHeader } from "@/shared/components/PageHeader";
import { AMENITIES, AMENITY_LABEL, PROPERTY_TYPES, PROPERTY_TYPE_LABEL, type Amenity, type PropertyType } from "@/shared/constants/enums";
import { getApiErrorMessage } from "@/shared/api/httpClient";
import type { CreateOfferPayload } from "@/shared/types/domain";
import { createOffer } from "../api/offersApi";

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

type OfferCreatePageProps = {
  embedded?: boolean;
  onCreated?: () => void;
  onCancel?: () => void;
};

export function OfferCreatePage({ embedded = false, onCreated, onCancel }: OfferCreatePageProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [areaM2, setAreaM2] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [parkingSpots, setParkingSpots] = useState("");
  const [propertyType, setPropertyType] = useState<PropertyType>("APARTAMENTO");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [address, setAddress] = useState("");
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [mediaUrl, setMediaUrl] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [imageName, setImageName] = useState("");

  const mutation = useMutation({
    mutationFn: (payload: CreateOfferPayload) => createOffer(payload),
    onSuccess: async (offer) => {
      await queryClient.invalidateQueries({ queryKey: ["offers"] });
      toast.success("Imóvel cadastrado com sucesso.");
      onCreated?.();
      if (!embedded) navigate(`/offers/${offer.id}`, { replace: true });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem.");
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setImageDataUrl(dataUrl);
      setImageName(file.name);
    } catch {
      toast.error("Não foi possível carregar a imagem.");
    }
  }

  function clearImage() {
    setImageDataUrl("");
    setImageName("");
  }

  function safeNumber(value: string) {
    return Math.max(0, Number(value || 0));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() || !price || !areaM2 || !city.trim() || !state.trim() || !neighborhood.trim()) {
      toast.error("Preencha os dados principais do imóvel.");
      return;
    }

    const mainImage = imageDataUrl || mediaUrl.trim();

    mutation.mutate({
      title: title.trim(),
      description: description.trim() || null,
      price: safeNumber(price),
      areaM2: safeNumber(areaM2),
      bedrooms: safeNumber(bedrooms),
      bathrooms: safeNumber(bathrooms),
      parkingSpots: safeNumber(parkingSpots),
      propertyType,
      status: "ATIVA",
      neighborhood: neighborhood.trim(),
      city: city.trim(),
      state: state.trim().toUpperCase(),
      address: address.trim() || null,
      amenities,
      media: mainImage ? [{ url: mainImage, type: "FOTO" }] : [],
    });
  }

  const form = (
    <form className="mx-auto max-w-5xl rounded-[1.7rem] border border-border bg-card p-4 shadow-card sm:p-5" onSubmit={handleSubmit}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Nova oferta</p>
          <h2 className="text-xl font-black text-foreground">Dados do imóvel</h2>
        </div>
        {onCancel ? <Button type="button" variant="secondary" size="sm" onClick={onCancel}>Voltar para ofertas</Button> : null}
      </div>

      <div className="grid gap-4">
        <section className="rounded-3xl border border-border bg-secondary/40 p-4">
          <h3 className="mb-4 text-sm font-black text-foreground">Informações principais</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Título do imóvel" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ex.: Apartamento em Boa Viagem" required />
            <Select label="Tipo" value={propertyType} onChange={(event) => setPropertyType(event.target.value as PropertyType)} required>
              {PROPERTY_TYPES.map((type) => <option key={type} value={type}>{PROPERTY_TYPE_LABEL[type]}</option>)}
            </Select>
          </div>
          <div className="mt-3">
            <Textarea label="Descrição" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Descreva os pontos fortes do imóvel" className="min-h-28" />
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-secondary/40 p-4">
          <h3 className="mb-4 text-sm font-black text-foreground">Preço e estrutura</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Preço" type="number" min={0} value={price} onChange={(event) => setPrice(event.target.value)} placeholder="450000" required />
            <Input label="Área m²" type="number" min={0} value={areaM2} onChange={(event) => setAreaM2(event.target.value)} placeholder="80" required />
            <Input label="Quartos" type="number" min={0} value={bedrooms} onChange={(event) => setBedrooms(event.target.value)} placeholder="3" required />
            <Input label="Banheiros" type="number" min={0} value={bathrooms} onChange={(event) => setBathrooms(event.target.value)} placeholder="2" required />
            <Input label="Vagas" type="number" min={0} value={parkingSpots} onChange={(event) => setParkingSpots(event.target.value)} placeholder="1" required />
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-secondary/40 p-4">
          <h3 className="mb-4 text-sm font-black text-foreground">Localização</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Bairro" value={neighborhood} onChange={(event) => setNeighborhood(event.target.value)} placeholder="Boa Viagem" required />
            <Input label="Cidade" value={city} onChange={(event) => setCity(event.target.value)} placeholder="Recife" required />
            <Input label="Estado" value={state} onChange={(event) => setState(event.target.value.toUpperCase())} placeholder="PE" maxLength={2} required />
            <Input label="Endereço" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Rua, número e complemento" />
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-secondary/40 p-4">
          <h3 className="mb-4 text-sm font-black text-foreground">Imagem principal</h3>
          <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
            <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-primary/30 bg-primary/5 p-4 text-center text-primary transition hover:bg-primary/10">
              <ImagePlus className="size-7" />
              <span className="mt-2 text-sm font-extrabold">Selecionar imagem</span>
              <input className="hidden" type="file" accept="image/*" onChange={handleImageChange} />
            </label>

            <div className="rounded-3xl border border-border bg-card p-3">
              {imageDataUrl ? (
                <div>
                  <img src={imageDataUrl} alt="Prévia do imóvel" className="h-44 w-full rounded-2xl object-cover" />
                  <div className="mt-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                    <span className="truncate">{imageName}</span>
                    <button type="button" className="inline-flex items-center gap-1 font-bold text-destructive" onClick={clearImage}>
                      <X className="size-4" /> Remover
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid h-44 place-items-center rounded-2xl bg-secondary text-center text-sm text-muted-foreground">
                  Prévia da imagem
                </div>
              )}
            </div>
          </div>
          <div className="mt-3">
            <Input label="URL da foto principal" value={mediaUrl} onChange={(event) => setMediaUrl(event.target.value)} placeholder="Opcional, caso prefira usar link" />
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-secondary/40 p-4">
          <h3 className="mb-4 text-sm font-black text-foreground">Comodidades</h3>
          <ChipGroup
            label="Selecione as comodidades"
            options={AMENITIES.map((amenity) => ({ value: amenity, label: AMENITY_LABEL[amenity] }))}
            value={amenities}
            onChange={setAmenities}
          />
        </section>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-card p-4 shadow-card">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <Building2 className="size-5" />
          </span>
          <div>
            <p className="font-black text-foreground">Pronto para publicar</p>
            <p className="text-sm text-muted-foreground">Revise as seções e publique o imóvel.</p>
          </div>
        </div>
        <Button type="submit" size="lg" loading={mutation.isPending}>
          Publicar imóvel
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </form>
  );

  if (embedded) return form;

  return (
    <div>
      <PageHeader
        eyebrow="Área de vendedor"
        title="Cadastrar imóvel"
        description="Preencha os dados da oferta e publique para receber interessados."
      />
      {form}
    </div>
  );
}
