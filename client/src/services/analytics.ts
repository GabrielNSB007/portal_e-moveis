import api from "./api";

export type SellerAnalyticsSummary = {
  totalViews: number;
  totalVisits: number;
  byOffer: Record<string, { views: number; visits: number }>;
};

export const registerOfferView = async (offerId: string) => api.post(`/analytics/offers/${offerId}/view`);
export const registerOfferVisit = async (offerId: string, scheduledFor?: string) => api.post(`/analytics/offers/${offerId}/visit`, { scheduledFor });
export const getSellerAnalyticsSummary = async () => api.get<SellerAnalyticsSummary>("/analytics/seller/summary");
