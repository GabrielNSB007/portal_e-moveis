import type { Amenity, MatchStatus, PropertyType, ProposalStatus } from "@/shared/constants/enums";

export type UserRole = "CLIENTE" | "VENDEDOR";

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role?: UserRole;
};

export type AuthPayload = {
  name?: string;
  email: string;
  password: string;
  phone?: string;
  userRole?: UserRole;
};

export type AuthResponse = {
  token?: string;
  accessToken?: string;
  user?: User;
  data?: {
    token?: string;
    accessToken?: string;
    user?: User;
  };
};

export type OfferMedia = {
  id?: string;
  url: string;
  type: "FOTO" | "VIDEO";
};

export type Offer = {
  id: string;
  title: string;
  description?: string | null;
  price: number | string;
  areaM2: number;
  bedrooms: number;
  bathrooms: number;
  parkingSpots: number;
  propertyType: PropertyType;
  status?: "ATIVA" | "PAUSADA" | "VENDIDA" | "EXPIRADA";
  neighborhood: string;
  city: string;
  state: string;
  address?: string | null;
  amenities: Amenity[];
  media?: OfferMedia[];
  user?: User;
  userId?: string;
  createdAt?: string;
};

export type CreateOfferPayload = {
  title: string;
  description?: string | null;
  price: number;
  areaM2: number;
  bedrooms: number;
  bathrooms: number;
  parkingSpots: number;
  propertyType: PropertyType;
  status?: "ATIVA" | "PAUSADA" | "VENDIDA" | "EXPIRADA";
  neighborhood: string;
  city: string;
  state: string;
  address?: string | null;
  amenities: Amenity[];
  media?: OfferMedia[];
};

export type Preference = {
  id: string;
  userId?: string;
  title?: string | null;
  minPrice?: number | string | null;
  maxPrice?: number | string | null;
  minAreaM2?: number | null;
  maxAreaM2?: number | null;
  minBedrooms?: number | null;
  minBathrooms?: number | null;
  minParkingSpots?: number | null;
  propertyTypes: PropertyType[];
  neighborhoods: string[];
  city: string;
  state: string;
  desiredAmenities: Amenity[];
  isActive: boolean;
  createdAt?: string;
};

export type CreatePreferencePayload = {
  title?: string;
  minPrice?: number | null;
  maxPrice?: number | null;
  minAreaM2?: number | null;
  maxAreaM2?: number | null;
  minBedrooms?: number | null;
  minBathrooms?: number | null;
  minParkingSpots?: number | null;
  propertyTypes: PropertyType[];
  neighborhoods: string[];
  city: string;
  state: string;
  desiredAmenities: Amenity[];
  isActive?: boolean;
};

export type Match = {
  id: string;
  offerId: string;
  preferenceId: string;
  score: number;
  status: MatchStatus;
  offer: Offer;
  preference?: Preference;
  createdAt?: string;
};

export type GenerateMatchesPayload = {
  preferenceId?: string;
  offerId?: string;
  minScore: number;
};

export type Proposal = {
  id: string;
  offerId: string;
  buyerId: string;
  message?: string | null;
  value?: number | string | null;
  status: ProposalStatus;
  offer?: Offer;
  buyer?: User;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateProposalPayload = {
  offerId: string;
  message?: string | null;
  value?: number | null;
};

export type PaginatedResponse<T> = {
  items: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
