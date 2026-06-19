import { api } from "@/shared/api/httpClient";
import type { CreateOfferPayload, Offer, PaginatedResponse } from "@/shared/types/domain";

type OfferFilters = {
  city?: string;
  state?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
};

function normalizeOffers(data: Offer[] | PaginatedResponse<Offer>) {
  return Array.isArray(data) ? data : data.items;
}

function cleanFilters(params?: OfferFilters) {
  if (!params) return undefined;

  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );
}

export async function getOffers(params?: OfferFilters) {
  const { data } = await api.get<Offer[] | PaginatedResponse<Offer>>("/offers", { params: cleanFilters(params) });
  return normalizeOffers(data);
}

export async function getOffer(id: string) {
  const { data } = await api.get<Offer>(`/offers/${id}`);
  return data;
}

export async function createOffer(payload: CreateOfferPayload) {
  const { data } = await api.post<Offer>("/offers", payload);
  return data;
}


export async function updateOfferStatus(id: string, status: Offer["status"]) {
  const { data } = await api.patch<Offer>(`/offers/${id}`, { status });
  return data;
}
