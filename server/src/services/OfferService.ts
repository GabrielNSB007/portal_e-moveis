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
};

export class OfferService {
  constructor(private readonly offerRepository = new OfferRepository()) {}

  async createOffer(data: CreateOfferDTO) {
    return this.offerRepository.create(data);
  }

  async findAll(filters: ListOffersInput) {
    return this.offerRepository.getMany(filters);
  }

  async findById(id: string) {
    const offer = await this.offerRepository.getById(id);

    if (!offer) {
      throw new AppError("Oferta não encontrada", 404);
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
