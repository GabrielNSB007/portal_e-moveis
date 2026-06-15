export type PropertyType = "APARTAMENTO" | "CASA" | "STUDIO" | "COBERTURA" | "TERRENO"
export type MediaType = "FOTO" | "VIDEO"

export interface CreateOfferMedia{
    url : string,
    type: MediaType
}

export interface CreateOffer {
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

  media?: CreateOfferMedia[]
  //adicionar matches e proposals
}

export interface UpdateOffer {
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

  media?: CreateOfferMedia[]
  //adicionar matches e proposals
}

export interface ReadDeleteOffer extends Partial<UpdateOffer>{
    id: string
}

