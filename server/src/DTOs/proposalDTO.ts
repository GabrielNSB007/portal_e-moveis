export interface CreateProposalDTO {
  offerId: string;
  buyerId: string;
  message?: string | null;
  value?: number | null;
}

export interface UpdateProposalDTO {
  message?: string | null;
  value?: number | null;
}