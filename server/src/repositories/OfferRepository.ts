import { type Offer, PrismaClient } from "@prisma/client";
import {CreateOfferDTO,UpdateOfferDTO} from "../DTOs/offerDTO";

export default class OfferRepository {
  private prisma = new PrismaClient();

  async create(data: CreateOfferDTO) {
    const { media, ...offerData } = data;

    return await this.prisma.offer.create({
      data: {
        ...offerData,
        media: media ? { create: media } : undefined,
      },

      include: {
        media: true,
      },
    });
  }

  async getById(id: string): Promise<Offer | null> {
    return await this.prisma.offer.findUnique({
      where: { id },
      include: {
        media: true,
      },
    });
  }

  async getMany(): Promise<Offer[]> {
    return await this.prisma.offer.findMany({
      include: {
        media: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async update(id: string, data: UpdateOfferDTO) {
    const { media, ...offerData } = data;

    return await this.prisma.offer.update({
      where: { id },

      data: {
        ...offerData,
        ...(media && {
          media: {
            deleteMany: {},
            create: media,
          },
        }),
      },

      include: {
        media: true,
      },
    });
  }

  async delete(id: string) {
    return await this.prisma.offer.delete({
      where: { id },
    });
  }
}
