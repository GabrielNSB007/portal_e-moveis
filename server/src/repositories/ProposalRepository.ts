import { MatchStatus, Prisma, ProposalStatus } from "@prisma/client";

import { prisma } from "../prisma.js";
import {
  CreateProposalDTO,
  UpdateProposalDTO,
  UpdateProposalStatusDTO,
} from "../DTOs/proposalDTO.js";

const PROPOSAL_INCLUDE = {
  buyer: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
    },
  },
  offer: {
    include: {
      media: true,
      user: {
        select: {
          id: true,
          name: true,
          phone: true,
          role: true,
        },
      },
    },
  },
} as const;

export class ProposalRepository {
  private toDecimal(value?: number | null) {
    if (value === undefined) return undefined;
    if (value === null) return null;
    return new Prisma.Decimal(value);
  }

  async create(data: CreateProposalDTO) {
    return prisma.proposal.create({
      data: {
        offerId: data.offerId,
        buyerId: data.buyerId,
        message: data.message,
        value: this.toDecimal(data.value),
      },
      include: PROPOSAL_INCLUDE,
    });
  }

  async findById(id: string) {
    return prisma.proposal.findUnique({
      where: { id },
      include: PROPOSAL_INCLUDE,
    });
  }

  async findByBuyerId(buyerId: string) {
    return prisma.proposal.findMany({
      where: { buyerId },
      include: PROPOSAL_INCLUDE,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findReceivedBySellerId(sellerId: string) {
    return prisma.proposal.findMany({
      where: {
        offer: {
          userId: sellerId,
        },
      },
      include: PROPOSAL_INCLUDE,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findByOfferId(offerId: string) {
    return prisma.proposal.findMany({
      where: { offerId },
      include: PROPOSAL_INCLUDE,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findExistingByBuyerAndOffer(offerId: string, buyerId: string) {
    return prisma.proposal.findUnique({
      where: {
        offerId_buyerId: {
          offerId,
          buyerId,
        },
      },
      include: PROPOSAL_INCLUDE,
    });
  }

  async update(id: string, data: UpdateProposalDTO) {
    const updateData: Prisma.ProposalUpdateInput = {};

    if ("message" in data) {
      updateData.message = data.message;
    }

    if ("value" in data) {
      updateData.value = this.toDecimal(data.value);
    }

    return prisma.proposal.update({
      where: { id },
      data: updateData,
      include: PROPOSAL_INCLUDE,
    });
  }

  async updateStatus(id: string, data: UpdateProposalStatusDTO) {
    return prisma.proposal.update({
      where: { id },
      data: {
        status: data.status,
      },
      include: PROPOSAL_INCLUDE,
    });
  }

  async cancel(id: string) {
    return prisma.proposal.update({
      where: { id },
      data: {
        status: ProposalStatus.CANCELADA,
      },
      include: PROPOSAL_INCLUDE,
    });
  }

  async findOfferById(offerId: string) {
    return prisma.offer.findUnique({
      where: { id: offerId },
      select: {
        id: true,
        userId: true,
        status: true,
      },
    });
  }

  async markRelatedMatchesAsProposalSent(offerId: string, buyerId: string) {
    return prisma.match.updateMany({
      where: {
        offerId,
        preference: {
          userId: buyerId,
        },
      },
      data: {
        status: MatchStatus.PROPOSTA_ENVIADA,
      },
    });
  }
}
