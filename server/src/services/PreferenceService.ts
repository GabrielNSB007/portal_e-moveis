import { Amenity, Prisma, PropertyType } from "@prisma/client";

import { prisma } from "../prisma.js";
import { AppError } from "../errors/AppError.js";

type NullableNumber = number | null | undefined;
type NullableInteger = number | null | undefined;

type CreatePreferenceInput = {
  userId: string;
  title?: string;

  minPrice?: NullableNumber;
  maxPrice?: NullableNumber;

  minAreaM2?: NullableNumber;
  maxAreaM2?: NullableNumber;

  minBedrooms?: NullableInteger;
  minBathrooms?: NullableInteger;
  minParkingSpots?: NullableInteger;

  propertyTypes?: PropertyType[];
  neighborhoods?: string[];

  city: string;
  state: string;

  desiredAmenities?: Amenity[];
  isActive?: boolean;
};

type UpdatePreferenceInput = Partial<Omit<CreatePreferenceInput, "userId">>;

type ListPreferencesInput = {
  userId: string;
  isActive?: boolean;
  city?: string;
  state?: string;
  page?: number;
  limit?: number;
};

export class PreferenceService {
  async create(input: CreatePreferenceInput) {
    this.assertRanges(input);

    return prisma.preference.create({
      data: {
        userId: input.userId,
        title: input.title,

        minPrice: this.toDecimalOrNullOrUndefined(input.minPrice),
        maxPrice: this.toDecimalOrNullOrUndefined(input.maxPrice),

        minAreaM2: input.minAreaM2,
        maxAreaM2: input.maxAreaM2,

        minBedrooms: input.minBedrooms,
        minBathrooms: input.minBathrooms,
        minParkingSpots: input.minParkingSpots,

        propertyTypes: input.propertyTypes ?? [],
        neighborhoods: this.normalizeStringList(input.neighborhoods),

        city: input.city.trim(),
        state: input.state.trim(),

        desiredAmenities: input.desiredAmenities ?? [],
        isActive: input.isActive ?? true,
      },
    });
  }

  async list({
    userId,
    isActive,
    city,
    state,
    page = 1,
    limit = 20,
  }: ListPreferencesInput) {
    const skip = (page - 1) * limit;

    const where: Prisma.PreferenceWhereInput = {
      userId,
      ...(typeof isActive === "boolean" ? { isActive } : {}),
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
    };

    const [items, total] = await Promise.all([
      prisma.preference.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
        include: {
          matches: {
            include: {
              offer: {
                include: {
                  media: true,
                },
              },
            },
            orderBy: {
              score: "desc",
            },
          },
        },
      }),
      prisma.preference.count({
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

  async getById(userId: string, id: string) {
    const preference = await prisma.preference.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        matches: {
          include: {
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
          },
          orderBy: {
            score: "desc",
          },
        },
      },
    });

    if (!preference) {
      throw new AppError("Preferência não encontrada", 404);
    }

    return preference;
  }

  async update(userId: string, id: string, input: UpdatePreferenceInput) {
    const currentPreference = await prisma.preference.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!currentPreference) {
      throw new AppError("Preferência não encontrada", 404);
    }

    const nextPreference = {
      minPrice:
        input.minPrice !== undefined
          ? input.minPrice
          : this.toOptionalNumber(currentPreference.minPrice),
      maxPrice:
        input.maxPrice !== undefined
          ? input.maxPrice
          : this.toOptionalNumber(currentPreference.maxPrice),
      minAreaM2:
        input.minAreaM2 !== undefined
          ? input.minAreaM2
          : currentPreference.minAreaM2,
      maxAreaM2:
        input.maxAreaM2 !== undefined
          ? input.maxAreaM2
          : currentPreference.maxAreaM2,
    };

    this.assertRanges(nextPreference);

    return prisma.preference.update({
      where: {
        id,
      },
      data: {
        ...(input.title !== undefined
          ? {
              title: input.title,
            }
          : {}),

        ...(input.minPrice !== undefined
          ? {
              minPrice: this.toDecimalOrNullOrUndefined(input.minPrice),
            }
          : {}),
        ...(input.maxPrice !== undefined
          ? {
              maxPrice: this.toDecimalOrNullOrUndefined(input.maxPrice),
            }
          : {}),

        ...(input.minAreaM2 !== undefined
          ? {
              minAreaM2: input.minAreaM2,
            }
          : {}),
        ...(input.maxAreaM2 !== undefined
          ? {
              maxAreaM2: input.maxAreaM2,
            }
          : {}),

        ...(input.minBedrooms !== undefined
          ? {
              minBedrooms: input.minBedrooms,
            }
          : {}),
        ...(input.minBathrooms !== undefined
          ? {
              minBathrooms: input.minBathrooms,
            }
          : {}),
        ...(input.minParkingSpots !== undefined
          ? {
              minParkingSpots: input.minParkingSpots,
            }
          : {}),

        ...(input.propertyTypes !== undefined
          ? {
              propertyTypes: input.propertyTypes,
            }
          : {}),
        ...(input.neighborhoods !== undefined
          ? {
              neighborhoods: this.normalizeStringList(input.neighborhoods),
            }
          : {}),

        ...(input.city !== undefined
          ? {
              city: input.city.trim(),
            }
          : {}),
        ...(input.state !== undefined
          ? {
              state: input.state.trim(),
            }
          : {}),

        ...(input.desiredAmenities !== undefined
          ? {
              desiredAmenities: input.desiredAmenities,
            }
          : {}),

        ...(input.isActive !== undefined
          ? {
              isActive: input.isActive,
            }
          : {}),
      },
    });
  }

  async deactivate(userId: string, id: string) {
    await this.ensurePreferenceBelongsToUser(userId, id);

    return prisma.preference.update({
      where: {
        id,
      },
      data: {
        isActive: false,
      },
    });
  }

  async activate(userId: string, id: string) {
    await this.ensurePreferenceBelongsToUser(userId, id);

    return prisma.preference.update({
      where: {
        id,
      },
      data: {
        isActive: true,
      },
    });
  }

  private async ensurePreferenceBelongsToUser(userId: string, id: string) {
    const preference = await prisma.preference.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!preference) {
      throw new AppError("Preferência não encontrada", 404);
    }

    return preference;
  }

  private assertRanges(input: {
    minPrice?: NullableNumber;
    maxPrice?: NullableNumber;
    minAreaM2?: NullableNumber;
    maxAreaM2?: NullableNumber;
  }) {
    if (
      input.minPrice !== undefined &&
      input.minPrice !== null &&
      input.maxPrice !== undefined &&
      input.maxPrice !== null &&
      input.minPrice > input.maxPrice
    ) {
      throw new AppError(
        "O preço máximo deve ser maior ou igual ao preço mínimo",
        400,
      );
    }

    if (
      input.minAreaM2 !== undefined &&
      input.minAreaM2 !== null &&
      input.maxAreaM2 !== undefined &&
      input.maxAreaM2 !== null &&
      input.minAreaM2 > input.maxAreaM2
    ) {
      throw new AppError(
        "A área máxima deve ser maior ou igual à área mínima",
        400,
      );
    }
  }

  private normalizeStringList(items?: string[]) {
    if (!items) {
      return [];
    }

    return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
  }

  private toDecimalOrNullOrUndefined(value?: NullableNumber) {
    if (value === undefined) {
      return undefined;
    }

    if (value === null) {
      return null;
    }

    return new Prisma.Decimal(value);
  }

  private toOptionalNumber(value: unknown) {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === "number") {
      return value;
    }

    if (typeof value === "string") {
      return Number(value);
    }

    if (
      typeof value === "object" &&
      value !== null &&
      "toNumber" in value &&
      typeof value.toNumber === "function"
    ) {
      return value.toNumber();
    }

    return Number(value);
  }
}
