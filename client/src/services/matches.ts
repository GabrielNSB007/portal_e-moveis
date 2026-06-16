import type {
  CreateMatch,
  CreateMatchResponse,
  DeleteMatchResponse,
  EvaluateMatch,
  GenerateMatches,
  GenerateMatchesResponse,
  ListMatchesParams,
  ListMatchesResponse,
  MatchEvaluation,
  ReadDeleteMatch,
  UpdateMatchStatus,
} from "../types/matchTypes";

import api from "./api";

export const evaluateMatch = async (matchData: EvaluateMatch) => {
  return api.post<MatchEvaluation>("/matches/evaluate", matchData);
};

export const createMatch = async (matchData: CreateMatch) => {
  return api.post<CreateMatchResponse>("/matches", matchData);
};

export const generateMatches = async (matchData: GenerateMatches) => {
  return api.post<GenerateMatchesResponse>("/matches/generate", matchData);
};

export const findManyMatches = async (params?: ListMatchesParams) => {
  return api.get<ListMatchesResponse>("/matches", { params });
};

export const findMatchById = async (id: string) => {
  return api.get<ReadDeleteMatch>(`/matches/${id}`);
};

export const updateMatchStatus = async (
  id: string,
  matchData: UpdateMatchStatus,
) => {
  return api.patch<ReadDeleteMatch>(`/matches/${id}/status`, matchData);
};

export const deleteMatch = async (id: string) => {
  return api.delete<DeleteMatchResponse>(`/matches/${id}`);
};