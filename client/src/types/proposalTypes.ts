export type DecimalLike = number | string;
export type DateTimeString = string;

export type OfferStatus = "ATIVA" | "PAUSADA" | "VENDIDA" | "EXPIRADA";

export interface ProposalBuyer {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
}

export interface ProposalOffer {
  id: string;
  title: string;
  price: DecimalLike;
  status: OfferStatus;
  userId: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface ReadDeleteProposal {
  id: string;
  offerId: string;
  buyerId: string;
  message?: string | null;
  value?: DecimalLike | null;
  createdAt: DateTimeString;
  buyer: ProposalBuyer;
  offer: ProposalOffer;
}

export interface CreateProposalFormData {
  offerId: string;
  message?: string | null;
  value?: number | null;
}

export interface UpdateProposalFormData {
  message?: string | null;
  value?: number | null;
}

export interface DeleteProposalResponse {
  message: string;
  proposal: ReadDeleteProposal;
}