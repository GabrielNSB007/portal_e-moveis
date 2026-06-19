import { api } from "@/shared/api/httpClient";
import type { GenerateMatchesPayload, Match, PaginatedResponse } from "@/shared/types/domain";
import type { MatchStatus } from "@/shared/constants/enums";

function normalizeMatches(data: Match[] | PaginatedResponse<Match> | { matches?: Match[] }) {
  if (Array.isArray(data)) return data;
  if ("items" in data) return data.items;
  return data.matches ?? [];
}

export async function generateMatches(payload: GenerateMatchesPayload) {
  const { data } = await api.post<Match[] | PaginatedResponse<Match> | { matches?: Match[] }>("/matches/generate", payload);
  return normalizeMatches(data);
}

export async function getMatches() {
  const { data } = await api.get<Match[] | PaginatedResponse<Match> | { matches?: Match[] }>("/matches");
  return normalizeMatches(data).filter((match) => match.score >= 70);
}

export async function getMatch(id: string) {
  const { data } = await api.get<Match>(`/matches/${id}`);
  return data;
}

export async function updateMatchStatus(id: string, status: MatchStatus) {
  const { data } = await api.patch<Match>(`/matches/${id}/status`, { status });
  return data;
}


export async function deleteMatch(id: string) {
  await api.delete(`/matches/${id}`);
}
