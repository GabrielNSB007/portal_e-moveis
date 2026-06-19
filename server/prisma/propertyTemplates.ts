import { Amenity, PropertyType } from "@prisma/client";

import type { ImageSubtype } from "./imagePool";

export type PropertyCategory = "APARTMENT" | "HOUSE" | "LAND";

export type PropertySubtype =
  | "APARTMENT"
  | "STUDIO"
  | "PENTHOUSE"
  | "SMALL_HOUSE"
  | "HOUSE"
  | "LUXURY_APARTMENT"
  | "LUXURY_HOUSE"
  | "LAND";

export type ListingPurpose = "SALE" | "RENT";

export type PropertyTemplate = {
  id: string;
  label: string;
  category: PropertyCategory;
  subtype: PropertySubtype;
  propertyType: PropertyType;
  purpose: ListingPurpose;
  isLuxury: boolean;
  bedrooms: [number, number];
  bathrooms: [number, number];
  parkingSpots: [number, number];
  areaM2: [number, number];
  price: [number, number];
  amenities: Amenity[];
  allowedImageSubtypes: ImageSubtype[];
  minLuxuryAreaM2?: number;
  minLuxuryPrice?: number;
};

export const PROPERTY_TEMPLATES: PropertyTemplate[] = [
  {
    id: "sale-apartment",
    label: "Apartamento",
    category: "APARTMENT",
    subtype: "APARTMENT",
    propertyType: PropertyType.APARTAMENTO,
    purpose: "SALE",
    isLuxury: false,
    bedrooms: [2, 3],
    bathrooms: [1, 3],
    parkingSpots: [1, 2],
    areaM2: [55, 115],
    price: [380000, 1200000],
    amenities: [Amenity.PORTARIA, Amenity.ELEVADOR, Amenity.VARANDA, Amenity.AREA_SERVICO],
    allowedImageSubtypes: ["APARTMENT"],
  },
  {
    id: "rent-apartment",
    label: "Apartamento para aluguel",
    category: "APARTMENT",
    subtype: "APARTMENT",
    propertyType: PropertyType.APARTAMENTO,
    purpose: "RENT",
    isLuxury: false,
    bedrooms: [1, 3],
    bathrooms: [1, 2],
    parkingSpots: [0, 2],
    areaM2: [45, 95],
    price: [1800, 8500],
    amenities: [Amenity.PORTARIA, Amenity.ELEVADOR, Amenity.MOBILIADO],
    allowedImageSubtypes: ["APARTMENT"],
  },
  {
    id: "studio-rent",
    label: "Studio",
    category: "APARTMENT",
    subtype: "STUDIO",
    propertyType: PropertyType.STUDIO,
    purpose: "RENT",
    isLuxury: false,
    bedrooms: [0, 1],
    bathrooms: [1, 1],
    parkingSpots: [0, 1],
    areaM2: [25, 60],
    price: [1400, 6200],
    amenities: [Amenity.MOBILIADO, Amenity.PORTARIA, Amenity.ACADEMIA],
    allowedImageSubtypes: ["STUDIO"],
  },
  {
    id: "penthouse-sale",
    label: "Cobertura",
    category: "APARTMENT",
    subtype: "PENTHOUSE",
    propertyType: PropertyType.COBERTURA,
    purpose: "SALE",
    isLuxury: true,
    bedrooms: [3, 5],
    bathrooms: [3, 5],
    parkingSpots: [2, 4],
    areaM2: [120, 320],
    price: [1300000, 4800000],
    amenities: [Amenity.PISCINA, Amenity.ACADEMIA, Amenity.CHURRASQUEIRA, Amenity.PORTARIA, Amenity.VARANDA],
    allowedImageSubtypes: ["PENTHOUSE"],
    minLuxuryAreaM2: 120,
    minLuxuryPrice: 1300000,
  },
  {
    id: "luxury-apartment-sale",
    label: "Apartamento alto padrao",
    category: "APARTMENT",
    subtype: "LUXURY_APARTMENT",
    propertyType: PropertyType.APARTAMENTO,
    purpose: "SALE",
    isLuxury: true,
    bedrooms: [3, 4],
    bathrooms: [3, 5],
    parkingSpots: [2, 4],
    areaM2: [130, 260],
    price: [1200000, 3600000],
    amenities: [Amenity.PISCINA, Amenity.ACADEMIA, Amenity.PORTARIA, Amenity.VARANDA, Amenity.MOBILIADO],
    allowedImageSubtypes: ["LUXURY_APARTMENT"],
    minLuxuryAreaM2: 130,
    minLuxuryPrice: 1200000,
  },
  {
    id: "small-house-sale",
    label: "Casa pequena",
    category: "HOUSE",
    subtype: "SMALL_HOUSE",
    propertyType: PropertyType.CASA,
    purpose: "SALE",
    isLuxury: false,
    bedrooms: [1, 2],
    bathrooms: [1, 2],
    parkingSpots: [0, 1],
    areaM2: [45, 95],
    price: [220000, 720000],
    amenities: [Amenity.PET_FRIENDLY, Amenity.AREA_SERVICO, Amenity.VARANDA],
    allowedImageSubtypes: ["SMALL_HOUSE"],
  },
  {
    id: "house-sale",
    label: "Casa",
    category: "HOUSE",
    subtype: "HOUSE",
    propertyType: PropertyType.CASA,
    purpose: "SALE",
    isLuxury: false,
    bedrooms: [2, 4],
    bathrooms: [1, 4],
    parkingSpots: [1, 3],
    areaM2: [85, 230],
    price: [420000, 1800000],
    amenities: [Amenity.PET_FRIENDLY, Amenity.CHURRASQUEIRA, Amenity.VARANDA, Amenity.AREA_SERVICO],
    allowedImageSubtypes: ["HOUSE"],
  },
  {
    id: "luxury-house-sale",
    label: "Casa de alto padrao",
    category: "HOUSE",
    subtype: "LUXURY_HOUSE",
    propertyType: PropertyType.CASA,
    purpose: "SALE",
    isLuxury: true,
    bedrooms: [4, 6],
    bathrooms: [4, 7],
    parkingSpots: [3, 5],
    areaM2: [220, 520],
    price: [1600000, 6200000],
    amenities: [Amenity.PISCINA, Amenity.CHURRASQUEIRA, Amenity.PET_FRIENDLY, Amenity.VARANDA, Amenity.AREA_SERVICO],
    allowedImageSubtypes: ["LUXURY_HOUSE"],
    minLuxuryAreaM2: 220,
    minLuxuryPrice: 1600000,
  },
  {
    id: "land-sale",
    label: "Terreno",
    category: "LAND",
    subtype: "LAND",
    propertyType: PropertyType.TERRENO,
    purpose: "SALE",
    isLuxury: false,
    bedrooms: [0, 0],
    bathrooms: [0, 0],
    parkingSpots: [0, 0],
    areaM2: [180, 800],
    price: [180000, 1300000],
    amenities: [],
    allowedImageSubtypes: ["HOUSE"],
  },
];
