import { OfferStatus, Prisma } from "@prisma/client";

import { CITY_CATALOG, type CityCatalogItem } from "./cities";
import type { ImageCatalogItem } from "./imagePool";
import { PROPERTY_TEMPLATES, type PropertyTemplate, type PropertySubtype } from "./propertyTemplates";

export type GeneratedProperty = {
  serial: string;
  title: string;
  description: string;
  price: Prisma.Decimal;
  areaM2: number;
  bedrooms: number;
  bathrooms: number;
  parkingSpots: number;
  propertyType: PropertyTemplate["propertyType"];
  status: OfferStatus;
  neighborhood: string;
  city: string;
  state: string;
  address: string;
  amenities: PropertyTemplate["amenities"];
  userId: string;
  templateId: string;
  category: PropertyTemplate["category"];
  subtype: PropertySubtype;
  purpose: PropertyTemplate["purpose"];
  isLuxury: boolean;
  images: ImageCatalogItem[];
};

function pick<T>(items: T[], index: number) {
  return items[index % items.length];
}

function rangeValue([min, max]: [number, number], index: number) {
  if (min === max) return min;
  return min + (index % (max - min + 1));
}

function roundTo(value: number, step: number) {
  return Math.round(value / step) * step;
}

function buildLocationSlots(total: number) {
  const slots = CITY_CATALOG.flatMap((location, locationIndex) =>
    Array.from({ length: Math.min(3, location.neighborhoods.length) }, (_, neighborhoodIndex) => ({
      location,
      neighborhood: pick(location.neighborhoods, locationIndex + neighborhoodIndex * 3),
    })),
  );
  const recife = CITY_CATALOG.find((location) => location.city === "Recife");

  if (recife) {
    for (let index = 0; index < 14 && slots.length < total; index += 1) {
      slots.push({
        location: recife,
        neighborhood: pick(recife.neighborhoods, index * 3),
      });
    }
  }

  const weightedLocations = CITY_CATALOG.flatMap((location) => {
    const weight = location.city === "Recife" ? 0 : location.extraWeight ?? 1;
    return Array.from({ length: weight }, () => location);
  });

  for (let index = slots.length; index < total; index += 1) {
    const location = pick(weightedLocations, index);
    slots.push({
      location,
      neighborhood: pick(location.neighborhoods, index * 7),
    });
  }

  return slots.slice(0, total);
}

const TEMPLATE_WEIGHTS = [
  "sale-apartment",
  "sale-apartment",
  "sale-apartment",
  "rent-apartment",
  "rent-apartment",
  "studio-rent",
  "studio-rent",
  "luxury-apartment-sale",
  "penthouse-sale",
  "house-sale",
  "small-house-sale",
];

function templateFor(index: number, location: CityCatalogItem) {
  if (location.city === "Recife" && index % 5 === 0) {
    return PROPERTY_TEMPLATES.find((template) => template.id === "rent-apartment") ?? PROPERTY_TEMPLATES[0];
  }

  const templateId = pick(TEMPLATE_WEIGHTS, index);
  return PROPERTY_TEMPLATES.find((template) => template.id === templateId) ?? PROPERTY_TEMPLATES[0];
}

function priceFor(template: PropertyTemplate, location: CityCatalogItem, index: number) {
  const [min, max] = template.price;
  const base = rangeValue([min, max], index * 17);
  const locationFactor = Math.max(0.65, Math.min(1.75, location.basePrice / 720000));
  const purposeFactor = template.purpose === "RENT" ? 1 : locationFactor;
  const value = template.purpose === "RENT" ? base : base * purposeFactor;
  const compatibleValue = template.isLuxury
    ? Math.max(value, template.minLuxuryPrice ?? min)
    : value;

  return roundTo(compatibleValue, template.purpose === "RENT" ? 100 : 1000);
}

function sortedCompatibleImages(
  template: PropertyTemplate,
  usage: Map<string, number>,
  stateUsage: Set<string>,
  cityUsage: Set<string>,
  index: number,
  imagePool: ImageCatalogItem[],
  recentImageUrls: string[],
) {
  return imagePool
    .filter((image) => template.allowedImageSubtypes.includes(image.subtype))
    .filter((image) => !template.isLuxury || image.tags.includes("LUXURY"))
    .filter((image) => !stateUsage.has(image.url))
    .filter((image) => !cityUsage.has(image.url))
    .filter((image) => !recentImageUrls.includes(image.url))
    .sort((left, right) => {
      const byUsage = (usage.get(left.id) ?? 0) - (usage.get(right.id) ?? 0);
      if (byUsage !== 0) return byUsage;
      return ((left.id.length + index) % 11) - ((right.id.length + index) % 11);
    });
}

function pickImages(
  template: PropertyTemplate,
  usage: Map<string, number>,
  imageUsageByState: Map<string, Set<string>>,
  imageUsageByCity: Map<string, Set<string>>,
  location: CityCatalogItem,
  index: number,
  imagePool: ImageCatalogItem[],
  recentImageUrls: string[],
) {
  const stateUsage = imageUsageByState.get(location.state) ?? new Set<string>();
  const cityKey = `${location.state}:${location.city}`;
  const cityUsage = imageUsageByCity.get(cityKey) ?? new Set<string>();
  const candidates = sortedCompatibleImages(template, usage, stateUsage, cityUsage, index, imagePool, recentImageUrls);
  if (candidates.length < 2) {
    throw new Error(`Template ${template.id} em ${location.city}/${location.state} precisa de pelo menos 2 imagens ineditas.`);
  }

  const selected = candidates.slice(0, 2);
  selected.forEach((image) => usage.set(image.id, (usage.get(image.id) ?? 0) + 1));
  selected.forEach((image) => stateUsage.add(image.url));
  selected.forEach((image) => cityUsage.add(image.url));
  imageUsageByState.set(location.state, stateUsage);
  imageUsageByCity.set(cityKey, cityUsage);
  selected.forEach((image) => recentImageUrls.push(image.url));
  if (recentImageUrls.length > 24) recentImageUrls.splice(0, recentImageUrls.length - 24);

  return selected;
}

export function generateProperties({
  total,
  sellerIds,
  imagePool,
}: {
  total: number;
  sellerIds: string[];
  imagePool: ImageCatalogItem[];
}) {
  if (!sellerIds.length) throw new Error("A seed precisa de pelo menos um vendedor.");
  if (!imagePool.length) throw new Error("A seed precisa de um catalogo de imagens.");

  const imageUsage = new Map<string, number>();
  const imageUsageByState = new Map<string, Set<string>>();
  const imageUsageByCity = new Map<string, Set<string>>();
  const recentImageUrls: string[] = [];
  const locationSlots = buildLocationSlots(total);

  return locationSlots.map(({ location, neighborhood }, index): GeneratedProperty => {
    const serial = String(index + 1).padStart(4, "0");
    const template = templateFor(index, location);
    const areaM2 = rangeValue(template.areaM2, index * 11);
    const bedrooms = rangeValue(template.bedrooms, index * 3);
    const bathrooms = rangeValue(template.bathrooms, index * 5);
    const parkingSpots = rangeValue(template.parkingSpots, index * 7);
    const price = priceFor(template, location, index);
    const images = pickImages(template, imageUsage, imageUsageByState, imageUsageByCity, location, index, imagePool, recentImageUrls);

    return {
      serial,
      title: `${template.label} em ${neighborhood}`,
      description: `${template.label} para ${template.purpose === "RENT" ? "aluguel" : "compra"} em ${neighborhood}, ${location.city}/${location.state}. Imovel gerado por catalogo validado com subtipo ${template.subtype}, filtros ${template.amenities.join(", ") || "sem comodidades obrigatorias"} e imagens buscadas por ${images.map((image) => image.searchQuery ?? image.subtype).join(" + ")}.`,
      price: new Prisma.Decimal(price),
      areaM2,
      bedrooms,
      bathrooms,
      parkingSpots,
      propertyType: template.propertyType,
      status: index % 19 === 0 ? OfferStatus.PAUSADA : OfferStatus.ATIVA,
      neighborhood,
      city: location.city,
      state: location.state,
      address: `Rua Seed ${serial}, ${100 + (index % 850)}`,
      amenities: template.amenities,
      userId: pick(sellerIds, index),
      templateId: template.id,
      category: template.category,
      subtype: template.subtype,
      purpose: template.purpose,
      isLuxury: template.isLuxury,
      images,
    };
  });
}

