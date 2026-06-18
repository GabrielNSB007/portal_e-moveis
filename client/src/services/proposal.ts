import type {
  CreateProposalFormData,
  DeleteProposalResponse,
  ReadDeleteProposal,
  UpdateProposalFormData,
} from "../types/proposalTypes";

import api from "./api";

export const createProposal = async (proposalData: CreateProposalFormData) => {
  const response = await api.post<ReadDeleteProposal>(
    "/proposals",
    proposalData,
  );

  return response.data;
};

export const findMyProposals = async () => {
  const response = await api.get<ReadDeleteProposal[]>("/proposals");

  return response.data;
};

export const findProposalsByOffer = async (offerId: string) => {
  const response = await api.get<ReadDeleteProposal[]>(
    `/proposals/offer/${offerId}`,
  );

  return response.data;
};

export const findProposalById = async (id: string) => {
  const response = await api.get<ReadDeleteProposal>(`/proposals/${id}`);

  return response.data;
};

export const updateProposal = async (
  id: string,
  proposalData: UpdateProposalFormData,
) => {
  const response = await api.put<ReadDeleteProposal>(
    `/proposals/${id}`,
    proposalData,
  );

  return response.data;
};

export const deleteProposal = async (id: string) => {
  const response = await api.delete<DeleteProposalResponse>(`/proposals/${id}`);

  return response.data;
};