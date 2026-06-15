// client/src/types/matchTypes.ts

export type MatchStatus =
  | "PENDENTE"
  | "VISUALIZADO"
  | "PROPOSTA_ENVIADA"
  | "RECUSADO"
  | "FEITO";

export type MatchClassification = "EXCELENTE" | "BOM" | "MEDIO" | "BAIXO";

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
  | "AREA_SERVICO";

export type MediaType = "FOTO" | "VIDEO";

export type DecimalLike = number | string;
export type DateTimeString = string;

export interface ScoreDetail {
  score: number;
  max: number;
  details: string[];
}

export interface MatchBreakdown {
  location: ScoreDetail;
  price: ScoreDetail;
  propertyType: ScoreDetail;
  specs: ScoreDetail;
  amenities: ScoreDetail;
}

export interface MatchEvaluation {
  score: number;
  classification: MatchClassification;
  isEligible: boolean;
  shouldCreateMatch: boolean;
  reasons: string[];
  breakdown: MatchBreakdown;
}

export interface UserSummary {
  id: string;
  name: string;
  phone?: string | null;
  role: "CLIENTE" | "VENDEDOR";
}

export interface MatchOfferMedia {
  id: string;
  url: string;
  type: MediaType;
  offerId: string;
  createdAt: DateTimeString;
}

export interface MatchOffer {
  id: string;
  title: string;
  description?: string | null;
  price: DecimalLike;
  areaM2: number;
  bedrooms: number;
  bathrooms: number;
  parkingSpots: number;
  propertyType: PropertyType;
  status: "ATIVA" | "PAUSADA" | "VENDIDA" | "EXPIRADA";
  neighborhood: string;
  city: string;
  state: string;
  address?: string | null;
  amenities: Amenity[];
  userId: string;
  user?: UserSummary;
  media?: MatchOfferMedia[];
  createdAt: DateTimeString;
  updatedAt: DateTimeString;
}

export interface MatchPreference {
  id: string;
  userId: string;
  user?: UserSummary;
  title?: string | null;
  minPrice?: DecimalLike | null;
  maxPrice?: DecimalLike | null;
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
  createdAt: DateTimeString;
  updatedAt: DateTimeString;
}

export interface ReadDeleteMatch {
  id: string;
  offerId: string;
  preferenceId: string;
  score: number;
  status: MatchStatus;
  offer?: MatchOffer;
  preference?: MatchPreference;
  createdAt: DateTimeString;
  updatedAt: DateTimeString;
}

export interface EvaluateMatch {
  offerId: string;
  preferenceId: string;
}

export interface CreateMatch extends EvaluateMatch {
  minScore?: number;
}

export interface GenerateMatches {
  offerId?: string;
  preferenceId?: string;
  minScore?: number;
}

export interface UpdateMatchStatus {
  status: MatchStatus;
}

export interface ListMatchesParams {
  status?: MatchStatus;
  minScore?: number;
  page?: number;
  limit?: number;
}

export interface CreateMatchResponse {
  createdOrUpdated: boolean;
  match: ReadDeleteMatch | null;
  evaluation: MatchEvaluation;
  message: string;
}

export interface GenerateMatchesResponse {
  createdOrUpdated: number;
  skipped: number;
  matches: ReadDeleteMatch[];
  evaluations: MatchEvaluation[];
}

export interface ListMatchesResponse {
  items: ReadDeleteMatch[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DeleteMatchResponse {
  message: string;
}