import { Amenity, MediaType, OfferStatus, PropertyType } from "@prisma/client";

export interface CreateOfferMediaDTO {
  url: string;
  type: MediaType;
}

export interface CreateOfferDTO {
  title: string;
  description?: string | null;
  price: number;
  areaM2: number;
  bedrooms: number;
  bathrooms: number;
  parkingSpots: number;
  propertyType: PropertyType;
  status?: OfferStatus;
  neighborhood: string;
  city: string;
  state: string;
  address?: string | null;
  amenities?: Amenity[];
  userId: string;
  media?: CreateOfferMediaDTO[];
}

export interface UpdateOfferDTO {
  title?: string;
  description?: string | null;
  price?: number;
  areaM2?: number;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpots?: number;
  propertyType?: PropertyType;
  status?: OfferStatus;
  neighborhood?: string;
  city?: string;
  state?: string;
  address?: string | null;
  amenities?: Amenity[];
  media?: CreateOfferMediaDTO[];
}
