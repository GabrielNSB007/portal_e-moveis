import { OfferStatus } from "@prisma/client";

import { CreateOfferDTO, UpdateOfferDTO } from "../DTOs/offerDTO.js";
import { AppError } from "../errors/AppError.js";
import OfferRepository from "../repositories/OfferRepository.js";

type ListOffersInput = {
  city?: string;
  state?: string;
  status?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  userId?: string;
};

export class OfferService {
  constructor(private readonly offerRepository = new OfferRepository()) {}

  async createOffer(data: CreateOfferDTO) {
    return this.offerRepository.create(data);
  }

  async findAll(filters: ListOffersInput) {
    return this.offerRepository.getMany(filters);
  }

  async findMine(userId: string, filters: Omit<ListOffersInput, "userId">) {
    return this.offerRepository.getMany({
      ...filters,
      userId,
    });
  }

  async findById(id: string, requesterId?: string) {
    const offer = await this.offerRepository.getById(id);

    if (!offer) {
      throw new AppError("Oferta não encontrada", 404);
    }

    if (offer.status === OfferStatus.PAUSADA) {
      const isOwner = requesterId && offer.userId === requesterId;

      const isAcceptedBuyer = requesterId
        ? await this.offerRepository.hasAcceptedProposalForUser(id, requesterId)
        : false;

      if (!isOwner && !isAcceptedBuyer) {
        throw new AppError("Este imóvel está em negociação", 423);
      }
    }

    return offer;
  }

  async updateOffer(userId: string, id: string, data: UpdateOfferDTO) {
    const offer = await this.offerRepository.getById(id);

    if (!offer) {
      throw new AppError("Oferta não encontrada", 404);
    }

    if (offer.userId !== userId) {
      throw new AppError(
        "Você não tem permissão para alterar esta oferta",
        403,
      );
    }

    return this.offerRepository.update(id, data);
  }

  async deleteOffer(userId: string, id: string) {
    const offer = await this.offerRepository.getById(id);

    if (!offer) {
      throw new AppError("Oferta não encontrada", 404);
    }

    if (offer.userId !== userId) {
      throw new AppError(
        "Você não tem permissão para remover esta oferta",
        403,
      );
    }

    return this.offerRepository.delete(id);
  }
}
