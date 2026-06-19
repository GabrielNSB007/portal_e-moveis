import { type Property } from "@/types/property";

const fallbackImages: string[] = [
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
];

export type BackendOfferMedia = {
  id?: string;
  url: string;
  type?: "FOTO" | "VIDEO" | "IMAGE" | string;
};

export type BackendOffer = {
  id: string;
  title: string;
  description?: string | null;
  price: string | number;
  areaM2: number;
  bedrooms: number;
  bathrooms: number;
  parkingSpots: number;
  propertyType: string;
  status?: string;
  neighborhood: string;
  city: string;
  state?: string;
  address?: string | null;
  amenities?: string[] | null;
  media?: BackendOfferMedia[] | null;
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    role?: string | null;
  } | null;
  createdAt?: string;
  updatedAt?: string;
};

export type BackendOffersResponse = {
  items: BackendOffer[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type BackendProposal = {
  id: string;
  offerId: string;
  buyerId: string;
  message?: string | null;
  value?: string | number | null;
  status: "PENDENTE" | "ACEITA" | "RECUSADA" | "CANCELADA" | string;
  createdAt: string;
  updatedAt?: string;
  offer: BackendOffer;
  buyer?: {
    id: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    role?: string | null;
  } | null;
};

const typeLabels: Record<string, Property["type"]> = {
  APARTAMENTO: "Apartamento",
  CASA: "Casa",
  STUDIO: "Studio",
  COBERTURA: "Cobertura",
  COMERCIAL: "Comercial",
  TERRENO: "Comercial",
};

const defaultNearby: Property["nearby"] = [
  { name: "Comercio local", distance: "500m", icon: "ShoppingBag" },
  { name: "Transporte publico", distance: "800m", icon: "Train" },
];

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function readOffersPayload(payload: BackendOffersResponse | BackendOffer[] | unknown): BackendOffer[] {
  if (Array.isArray(payload)) return payload as BackendOffer[];
  if (payload && typeof payload === "object" && "items" in payload) {
    const items = (payload as BackendOffersResponse).items;
    return Array.isArray(items) ? items : [];
  }
  return [];
}

export function mapOfferToProperty(offer: BackendOffer, index = 0): Property {
  const mediaImages = (offer.media ?? [])
    .filter((media) => !media.type || media.type === "FOTO" || media.type === "IMAGE")
    .map((media) => media.url)
    .filter(Boolean);
  const images = mediaImages.length ? mediaImages : fallbackImages.slice(index % Math.max(fallbackImages.length - 3, 1), index % Math.max(fallbackImages.length - 3, 1) + 4);
  const amenities = offer.amenities?.length ? offer.amenities : ["Portaria", "Boa localizacao"];
  const phone = offer.user?.phone ?? "+55 11 99999-0000";
  const agent = offer.user?.name ?? "Anunciante Portal E-moveis";

  return {
    id: offer.id,
    title: offer.title,
    neighborhood: offer.neighborhood,
    city: offer.city,
    state: offer.state,
    price: Number(offer.price),
    type: typeLabels[offer.propertyType] ?? "Apartamento",
    bedrooms: offer.bedrooms,
    bathrooms: offer.bathrooms,
    area: offer.areaM2,
    parking: offer.parkingSpots,
    match: Math.max(74, 94 - (index % 8) * 3),
    images: images.length ? images : fallbackImages.slice(0, 4),
    description: offer.description ?? "Imovel anunciado no Portal E-moveis com dados prontos para matchmaking.",
    amenities,
    nearby: defaultNearby,
    reason: "Compativel com filtros ativos, localizacao e estrutura informada pelo anunciante.",
    petFriendly: amenities.some((amenity) => amenity.toLowerCase().includes("pet")),
    contact: {
      agent,
      phone,
      whatsapp: phone,
      email: offer.user?.email ?? "contato@emoveis.app",
    },
  };
}

export function mapOffersToProperties(offers: BackendOffer[]) {
  return offers.map((offer, index) => mapOfferToProperty(offer, index));
}

export function formatDateLabel(value?: string) {
  if (!value) return "hoje";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "hoje";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(date);
}
