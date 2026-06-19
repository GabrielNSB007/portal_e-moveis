import api from "./api";
import type { BackendOffer } from "@/lib/offer-mappers";

export type SavedOfferResponse = {
  id: string;
  userId: string;
  offerId: string;
  createdAt: string;
  offer: BackendOffer;
};

export const listSavedOffers = async () => api.get<SavedOfferResponse[]>("/saved-offers");
export const saveOffer = async (offerId: string) => api.post<SavedOfferResponse>("/saved-offers", { offerId });
export const removeSavedOffer = async (offerId: string) => api.delete(`/saved-offers/${offerId}`);
