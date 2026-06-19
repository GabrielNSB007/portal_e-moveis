import { OfferStatus, ProposalStatus } from "@prisma/client";

import {
  CreateProposalDTO,
  UpdateProposalDTO,
  UpdateProposalStatusDTO,
} from "../DTOs/proposalDTO.js";
import { AppError } from "../errors/AppError.js";
import { ProposalRepository } from "../repositories/ProposalRepository.js";
import { prisma } from "../prisma.js";

export class ProposalService {
  constructor(private readonly proposalRepository = new ProposalRepository()) {}

  async create(data: CreateProposalDTO) {
    const offer = await this.proposalRepository.findOfferById(data.offerId);

    if (!offer) {
      throw new AppError("Oferta não encontrada", 404);
    }

    if (offer.userId === data.buyerId) {
      throw new AppError(
        "Você não pode enviar proposta para seu próprio imóvel",
        422,
      );
    }

    if (offer.status !== OfferStatus.ATIVA) {
      throw new AppError(
        "Só é possível enviar proposta para imóveis ativos",
        422,
      );
    }

    const existingProposal =
      await this.proposalRepository.findExistingByBuyerAndOffer(
        data.offerId,
        data.buyerId,
      );

    if (existingProposal) {
      throw new AppError("Você já enviou uma proposta para este imóvel", 409);
    }

    const proposal = await this.proposalRepository.create(data);

    await prisma.notification.create({
      data: {
        userId: proposal.offer.userId,
        offerId: proposal.offerId,
        type: "proposal",
        title: "Nova proposta recebida",
        description: `${proposal.buyer.name} demonstrou interesse em ${proposal.offer.title}.`,
      },
    });

    await this.proposalRepository.markRelatedMatchesAsProposalSent(
      data.offerId,
      data.buyerId,
    );

    return proposal;
  }

  async listMine(buyerId: string) {
    return this.proposalRepository.findByBuyerId(buyerId);
  }

  async listReceived(sellerId: string) {
    return this.proposalRepository.findReceivedBySellerId(sellerId);
  }

  async listByOffer(offerId: string, requesterId: string) {
    const offer = await this.proposalRepository.findOfferById(offerId);

    if (!offer) {
      throw new AppError("Oferta não encontrada", 404);
    }

    if (offer.userId !== requesterId) {
      throw new AppError(
        "Você não tem permissão para acessar propostas desta oferta",
        403,
      );
    }

    return this.proposalRepository.findByOfferId(offerId);
  }

  async findById(id: string, requesterId: string) {
    const proposal = await this.proposalRepository.findById(id);

    if (!proposal) {
      throw new AppError("Proposta não encontrada", 404);
    }

    const isBuyer = proposal.buyerId === requesterId;
    const isOfferOwner = proposal.offer.userId === requesterId;

    if (!isBuyer && !isOfferOwner) {
      throw new AppError(
        "Você não tem permissão para acessar esta proposta",
        403,
      );
    }

    return proposal;
  }

  async update(id: string, requesterId: string, data: UpdateProposalDTO) {
    const proposal = await this.proposalRepository.findById(id);

    if (!proposal) {
      throw new AppError("Proposta não encontrada", 404);
    }

    if (proposal.buyerId !== requesterId) {
      throw new AppError("Apenas o comprador pode editar esta proposta", 403);
    }

    if (proposal.status !== ProposalStatus.PENDENTE) {
      throw new AppError("Só é possível editar proposta pendente", 422);
    }

    return this.proposalRepository.update(id, data);
  }

  async updateStatus(
    id: string,
    requesterId: string,
    data: UpdateProposalStatusDTO,
  ) {
    const proposal = await this.proposalRepository.findById(id);

    if (!proposal) {
      throw new AppError("Proposta não encontrada", 404);
    }

    if (proposal.status !== ProposalStatus.PENDENTE) {
      throw new AppError(
        "Só é possível alterar status de proposta pendente",
        422,
      );
    }

    const isBuyer = proposal.buyerId === requesterId;
    const isOfferOwner = proposal.offer.userId === requesterId;

    if (!isBuyer && !isOfferOwner) {
      throw new AppError(
        "Você não tem permissão para alterar esta proposta",
        403,
      );
    }

    if (isBuyer && data.status !== ProposalStatus.CANCELADA) {
      throw new AppError("Comprador só pode cancelar a própria proposta", 422);
    }

    if (
      isOfferOwner &&
      data.status !== ProposalStatus.ACEITA &&
      data.status !== ProposalStatus.RECUSADA
    ) {
      throw new AppError("Vendedor só pode aceitar ou recusar proposta", 422);
    }

    const updated = await this.proposalRepository.updateStatus(id, data);

    const title = data.status === ProposalStatus.ACEITA
      ? "Proposta aceita"
      : data.status === ProposalStatus.RECUSADA
        ? "Proposta recusada"
        : "Proposta atualizada";

    const targetUserId = data.status === ProposalStatus.CANCELADA
      ? updated.offer.userId
      : updated.buyerId;

    await prisma.notification.create({
      data: {
        userId: targetUserId,
        offerId: updated.offerId,
        type: data.status === ProposalStatus.ACEITA ? "match" : "proposal",
        title,
        description: `${updated.offer.title}: status alterado para ${data.status.toLowerCase()}.`,
      },
    });

    return updated;
  }

  async cancel(id: string, requesterId: string) {
    return this.updateStatus(id, requesterId, {
      status: ProposalStatus.CANCELADA,
    });
  }
}
