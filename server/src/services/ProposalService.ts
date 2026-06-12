import { OfferStatus } from "@prisma/client";
import { CreateProposalDTO, UpdateProposalDTO } from "../DTOs/proposalDTO.js";
import { ProposalRepository } from "../repositories/ProposalRepository.js";

export const ProposalServiceError = {
  OFFER_NOT_FOUND: "Imóvel não encontrado",
  PROPOSAL_NOT_FOUND: "Proposta não encontrada",
  FORBIDDEN: "Você não tem permissão para acessar esta proposta",
  OWN_OFFER: "Você não pode enviar proposta para seu próprio imóvel",
  OFFER_NOT_ACTIVE: "Só é possível enviar proposta para imóveis ativos",
  PROPOSAL_ALREADY_EXISTS: "Você já enviou uma proposta para este imóvel",
  NO_UPDATE_FIELDS: "Informe ao menos um campo para atualizar",
} as const;

export class ProposalService {
  constructor(private readonly proposalRepository = new ProposalRepository()) {}

  async create(data: CreateProposalDTO) {
    const offer = await this.proposalRepository.findOfferById(data.offerId);

    if (!offer) {
      throw new Error(ProposalServiceError.OFFER_NOT_FOUND);
    }

    if (offer.userId === data.buyerId) {
      throw new Error(ProposalServiceError.OWN_OFFER);
    }

    if (offer.status !== OfferStatus.ATIVA) {
      throw new Error(ProposalServiceError.OFFER_NOT_ACTIVE);
    }

    const existingProposal =
      await this.proposalRepository.findExistingByBuyerAndOffer(
        data.offerId,
        data.buyerId,
      );

    if (existingProposal) {
      throw new Error(ProposalServiceError.PROPOSAL_ALREADY_EXISTS);
    }

    return this.proposalRepository.create(data);
  }

  async listMine(buyerId: string) {
    return this.proposalRepository.findByBuyerId(buyerId);
  }

  async listByOffer(offerId: string, requesterId: string) {
    const offer = await this.proposalRepository.findOfferById(offerId);

    if (!offer) {
      throw new Error(ProposalServiceError.OFFER_NOT_FOUND);
    }

    if (offer.userId !== requesterId) {
      throw new Error(ProposalServiceError.FORBIDDEN);
    }

    return this.proposalRepository.findByOfferId(offerId);
  }

  async findById(id: string, requesterId: string) {
    const proposal = await this.proposalRepository.findById(id);

    if (!proposal) {
      throw new Error(ProposalServiceError.PROPOSAL_NOT_FOUND);
    }

    const isBuyer = proposal.buyerId === requesterId;
    const isOfferOwner = proposal.offer.userId === requesterId;

    if (!isBuyer && !isOfferOwner) {
      throw new Error(ProposalServiceError.FORBIDDEN);
    }

    return proposal;
  }

  async update(id: string, requesterId: string, data: UpdateProposalDTO) {
    if (Object.keys(data).length === 0) {
      throw new Error(ProposalServiceError.NO_UPDATE_FIELDS);
    }

    const proposal = await this.proposalRepository.findById(id);

    if (!proposal) {
      throw new Error(ProposalServiceError.PROPOSAL_NOT_FOUND);
    }

    if (proposal.buyerId !== requesterId) {
      throw new Error(ProposalServiceError.FORBIDDEN);
    }

    return this.proposalRepository.update(id, data);
  }

  async delete(id: string, requesterId: string) {
    const proposal = await this.proposalRepository.findById(id);

    if (!proposal) {
      throw new Error(ProposalServiceError.PROPOSAL_NOT_FOUND);
    }

    if (proposal.buyerId !== requesterId) {
      throw new Error(ProposalServiceError.FORBIDDEN);
    }

    return this.proposalRepository.delete(id);
  }
}