import api from "./api";
import type { BackendOffer } from "@/lib/offer-mappers";

export type BackendMatch = {
  id: string;
  offerId: string;
  preferenceId: string;
  score: number;
  status: "PENDENTE" | "VISUALIZADO" | "PROPOSTA_ENVIADA" | "RECUSADO" | "FEITO" | string;
  createdAt: string;
  updatedAt: string;
  offer: BackendOffer;
  preference?: {
    id: string;
    userId: string;
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
      phone?: string | null;
      role?: string | null;
    } | null;
  };
};

export type MatchesResponse = {
  items: BackendMatch[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export const listMatches = async () => api.get<MatchesResponse>("/matches", { params: { limit: 50 } });
export const updateMatchStatus = async (id: string, status: BackendMatch["status"]) => api.patch<BackendMatch>(`/matches/${id}/status`, { status });


