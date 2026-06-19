import { api } from "@/shared/api/httpClient";
import type { CreateProposalPayload, PaginatedResponse, Proposal } from "@/shared/types/domain";
import type { ProposalStatus } from "@/shared/constants/enums";

function normalizeProposals(data: Proposal[] | PaginatedResponse<Proposal>) {
  return Array.isArray(data) ? data : data.items;
}

export async function createProposal(payload: CreateProposalPayload) {
  const { data } = await api.post<Proposal>("/proposals", payload);
  return data;
}

export async function getMyProposals() {
  const { data } = await api.get<Proposal[] | PaginatedResponse<Proposal>>("/proposals");
  return normalizeProposals(data);
}

export async function getReceivedProposals() {
  const { data } = await api.get<Proposal[] | PaginatedResponse<Proposal>>("/proposals/received");
  return normalizeProposals(data);
}

export async function updateProposalStatus(id: string, status: ProposalStatus) {
  const { data } = await api.patch<Proposal>(`/proposals/${id}/status`, { status });
  return data;
}

export async function cancelProposal(id: string) {
  const { data } = await api.delete<Proposal | { proposal: Proposal }>(`/proposals/${id}`);
  return "proposal" in data ? data.proposal : data;
}
