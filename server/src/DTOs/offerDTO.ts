import { MediaType, PropertyType, Prisma } from "@prisma/client";

export interface CreateOfferMediaDTO{
    url : string,
    type: MediaType
}

export interface CreateOfferDTO {
  title: string;
  description?: string;

  price: number;

  areaM2: number;
  bedrooms: number;
  bathrooms: number;
  parkingSpots: number;

  propertyType: PropertyType;

  neighborhood: string;
  city: string;
  state: string;

  userId: string;

  media?: CreateOfferMediaDTO[]
  //adicionar matches e proposals
}

export interface UpdateOfferDTO {
  title?: string;
  description?: string;

  price?: number;

  areaM2?: number;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpots?: number;

  propertyType?: PropertyType;

  neighborhood?: string;
  city?: string;
  state?: string;

  media?: CreateOfferMediaDTO[]
  //adicionar matches e proposals
}

export interface DeleteOfferDTO extends Partial<UpdateOfferDTO>{
    id: string
}

export interface ReadOfferDTO extends DeleteOfferDTO{}