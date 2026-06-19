import { Prisma, ProposalStatus } from "@prisma/client";

import { prisma } from "../prisma.js";
import { CreateOfferDTO, UpdateOfferDTO } from "../DTOs/offerDTO.js";

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

const OFFER_INCLUDE = {
  media: true,
  user: {
    select: {
      id: true,
      name: true,
      phone: true,
      role: true,
    },
  },
} as const;

export default class OfferRepository {
  private toDecimal(value?: number) {
    if (value === undefined) return undefined;
    return new Prisma.Decimal(value);
  }

  async create(data: CreateOfferDTO) {
    const { media, price, ...offerData } = data;

    return prisma.offer.create({
      data: {
        ...offerData,
        price: new Prisma.Decimal(price),
        media: media?.length
          ? {
              create: media,
            }
          : undefined,
      },
      include: OFFER_INCLUDE,
    });
  }

  async getById(id: string) {
    return prisma.offer.findUnique({
      where: { id },
      include: OFFER_INCLUDE,
    });
  }

  async getMany({
    city,
    state,
    status,
    propertyType,
    minPrice,
    maxPrice,
    page = 1,
    limit = 20,
    userId,
  }: ListOffersInput) {
    const skip = (page - 1) * limit;

    const where: Prisma.OfferWhereInput = {
      ...(userId ? { userId } : {}),
      ...(city
        ? {
            city: {
              equals: city,
              mode: "insensitive",
            },
          }
        : {}),
      ...(state
        ? {
            state: {
              equals: state,
              mode: "insensitive",
            },
          }
        : {}),
      ...(status ? { status: status as any } : {}),
      ...(propertyType ? { propertyType: propertyType as any } : {}),
      ...(minPrice !== undefined || maxPrice !== undefined
        ? {
            price: {
              ...(minPrice !== undefined
                ? {
                    gte: new Prisma.Decimal(minPrice),
                  }
                : {}),
              ...(maxPrice !== undefined
                ? {
                    lte: new Prisma.Decimal(maxPrice),
                  }
                : {}),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.offer.findMany({
        where,
        include: OFFER_INCLUDE,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.offer.count({
        where,
      }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, data: UpdateOfferDTO) {
    const { media, price, ...offerData } = data;

    return prisma.offer.update({
      where: { id },
      data: {
        ...offerData,
        ...(price !== undefined
          ? {
              price: this.toDecimal(price),
            }
          : {}),
        ...(media !== undefined
          ? {
              media: {
                deleteMany: {},
                create: media,
              },
            }
          : {}),
      },
      include: OFFER_INCLUDE,
    });
  }

  async delete(id: string) {
    return prisma.offer.delete({
      where: { id },
      include: {
        media: true,
      },
    });
  }

  async hasAcceptedProposalForUser(offerId: string, userId: string) {
    const proposal = await prisma.proposal.findFirst({
      where: {
        offerId,
        buyerId: userId,
        status: ProposalStatus.ACEITA,
      },
      select: {
        id: true,
      },
    });

    return Boolean(proposal);
  }
}
