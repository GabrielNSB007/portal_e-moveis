export type PropertyType =
  | "APARTAMENTO"
  | "CASA"
  | "STUDIO"
  | "COBERTURA"
  | "TERRENO";

export type Amenity =
  | "PISCINA"
  | "ACADEMIA"
  | "CHURRASQUEIRA"
  | "ELEVADOR"
  | "PORTARIA"
  | "MOBILIADO"
  | "PET_FRIENDLY"
  | "VARANDA"
  | "AREA_SERVICO"

export interface CreatePreference {
  title?: string;

  minPrice?: number;
  maxPrice?: number;

  minAreaM2?: number;
  maxAreaM2?: number;

  minBedrooms?: number;
  minBathrooms?: number;
  minParkingSpots?: number;

  propertyTypes?: PropertyType[];

  neighborhoods?: string[];

  city: string;
  state: string;

  desiredAmenities?: Amenity[];

  isActive?: boolean;
}

export interface UpdatePreference {
  title?: string;

  minPrice?: number;
  maxPrice?: number;

  minAreaM2?: number;
  maxAreaM2?: number;

  minBedrooms?: number;
  minBathrooms?: number;
  minParkingSpots?: number;

  propertyTypes?: PropertyType[];

  neighborhoods?: string[];

  city?: string;
  state?: string;

  desiredAmenities?: Amenity[];

  isActive?: boolean;
}

export interface ReadDeletePreference
  extends Partial<UpdatePreference> {
  id: string;
}