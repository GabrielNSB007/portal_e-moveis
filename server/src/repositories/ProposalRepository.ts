import { Prisma } from "@prisma/client";
import { prisma } from "../prisma.js";
import { CreateProposalDTO, UpdateProposalDTO } from "../DTOs/proposalDTO.js";

const proposalInclude = {
  buyer: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  },
  offer: {
    select: {
      id: true,
      title: true,
      price: true,
      status: true,
      userId: true,
      neighborhood: true,
      city: true,
      state: true,
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
      include: proposalInclude,
    });
  }

  async findById(id: string) {
    return prisma.proposal.findUnique({
      where: { id },
      include: proposalInclude,
    });
  }

  async findByBuyerId(buyerId: string) {
    return prisma.proposal.findMany({
      where: { buyerId },
      include: proposalInclude,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findByOfferId(offerId: string) {
    return prisma.proposal.findMany({
      where: { offerId },
      include: proposalInclude,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findExistingByBuyerAndOffer(offerId: string, buyerId: string) {
    return prisma.proposal.findFirst({
      where: {
        offerId,
        buyerId,
      },
      include: proposalInclude,
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
      include: proposalInclude,
    });
  }

  async delete(id: string) {
    return prisma.proposal.delete({
      where: { id },
      include: proposalInclude,
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
}