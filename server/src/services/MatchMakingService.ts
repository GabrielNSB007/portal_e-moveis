import {
  Amenity,
  MatchStatus,
  Offer,
  OfferStatus,
  Preference,
  Prisma,
  PropertyType,
} from "@prisma/client";

import { prisma } from "../prisma.js";
import { AppError } from "../errors/AppError.js";

type ScoreDetail = {
  score: number;
  max: number;
  details: string[];
};

type MatchBreakdown = {
  location: ScoreDetail;
  price: ScoreDetail;
  propertyType: ScoreDetail;
  specs: ScoreDetail;
  amenities: ScoreDetail;
};

type MatchEvaluation = {
  score: number;
  classification: "EXCELENTE" | "BOM" | "MEDIO" | "BAIXO";
  isEligible: boolean;
  shouldCreateMatch: boolean;
  reasons: string[];
  breakdown: MatchBreakdown;
};

type CreateMatchInput = {
  userId: string;
  offerId: string;
  preferenceId: string;
  minScore?: number;
};

type GenerateMatchesInput = {
  userId: string;
  offerId?: string;
  preferenceId?: string;
  minScore?: number;
};

type ListMatchesInput = {
  userId: string;
  status?: MatchStatus;
  minScore?: number;
  page?: number;
  limit?: number;
};

const DEFAULT_MIN_SCORE = 60;

const MATCH_INCLUDE = {
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
  preference: {
    include: {
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

export class MatchmakingService {
  async evaluatePair(userId: string, offerId: string, preferenceId: string) {
    const { offer, preference } = await this.getOfferAndPreference(
      offerId,
      preferenceId,
    );

    this.ensureUserCanAccessPair(userId, offer, preference);

    return this.calculateMatch(offer, preference);
  }

  async createFromPair({
    userId,
    offerId,
    preferenceId,
    minScore,
  }: CreateMatchInput) {
    const threshold = minScore ?? DEFAULT_MIN_SCORE;

    const { offer, preference } = await this.getOfferAndPreference(
      offerId,
      preferenceId,
    );

    this.ensureUserCanAccessPair(userId, offer, preference);

    const evaluation = this.calculateMatch(offer, preference, threshold);

    if (!evaluation.shouldCreateMatch) {
      return {
        createdOrUpdated: false,
        match: null,
        evaluation,
        message: `Match não criado porque não passou nos critérios mínimos.`,
      };
    }

    const match = await prisma.match.upsert({
      where: {
        offerId_preferenceId: {
          offerId,
          preferenceId,
        },
      },
      update: {
        score: evaluation.score,
      },
      create: {
        offerId,
        preferenceId,
        score: evaluation.score,
      },
      include: MATCH_INCLUDE,
    });

    return {
      createdOrUpdated: true,
      match,
      evaluation,
      message: "Match criado ou atualizado com sucesso.",
    };
  }

  async generateMatches({
    userId,
    offerId,
    preferenceId,
    minScore,
  }: GenerateMatchesInput) {
    const threshold = minScore ?? DEFAULT_MIN_SCORE;

    if (offerId && preferenceId) {
      const result = await this.createFromPair({
        userId,
        offerId,
        preferenceId,
        minScore: threshold,
      });

      return {
        createdOrUpdated: result.createdOrUpdated ? 1 : 0,
        skipped: result.createdOrUpdated ? 0 : 1,
        matches: result.match ? [result.match] : [],
        evaluations: [result.evaluation],
      };
    }

    const pairs = await this.buildCandidatePairs(userId, offerId, preferenceId);

    const matches = [];
    const evaluations: MatchEvaluation[] = [];
    let skipped = 0;

    for (const pair of pairs) {
      const evaluation = this.calculateMatch(
        pair.offer,
        pair.preference,
        threshold,
      );

      evaluations.push(evaluation);

      if (!evaluation.shouldCreateMatch) {
        skipped++;
        continue;
      }

      const match = await prisma.match.upsert({
        where: {
          offerId_preferenceId: {
            offerId: pair.offer.id,
            preferenceId: pair.preference.id,
          },
        },
        update: {
          score: evaluation.score,
        },
        create: {
          offerId: pair.offer.id,
          preferenceId: pair.preference.id,
          score: evaluation.score,
        },
        include: MATCH_INCLUDE,
      });

      matches.push(match);
    }

    return {
      createdOrUpdated: matches.length,
      skipped,
      matches,
      evaluations,
    };
  }

  async listMatches({
    userId,
    status,
    minScore,
    page = 1,
    limit = 20,
  }: ListMatchesInput) {
    const skip = (page - 1) * limit;

    const where: Prisma.MatchWhereInput = {
      AND: [
        {
          OR: [
            {
              preference: {
                userId,
              },
            },
            {
              offer: {
                userId,
              },
            },
          ],
        },
        status ? { status } : {},
        typeof minScore === "number"
          ? {
              score: {
                gte: minScore,
              },
            }
          : {},
      ],
    };

    const [items, total] = await Promise.all([
      prisma.match.findMany({
        where,
        include: MATCH_INCLUDE,
        orderBy: [
          {
            score: "desc",
          },
          {
            createdAt: "desc",
          },
        ],
        skip,
        take: limit,
      }),
      prisma.match.count({
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

  async getMatchById(userId: string, id: string) {
    const match = await prisma.match.findFirst({
      where: {
        id,
        OR: [
          {
            preference: {
              userId,
            },
          },
          {
            offer: {
              userId,
            },
          },
        ],
      },
      include: MATCH_INCLUDE,
    });

    if (!match) {
      throw new AppError("Match não encontrado", 404);
    }

    return match;
  }

  async updateStatus(userId: string, id: string, status: MatchStatus) {
    await this.getMatchById(userId, id);

    return prisma.match.update({
      where: {
        id,
      },
      data: {
        status,
      },
      include: MATCH_INCLUDE,
    });
  }

  async deleteMatch(userId: string, id: string) {
    await this.getMatchById(userId, id);

    await prisma.match.delete({
      where: {
        id,
      },
    });

    return {
      message: "Match removido com sucesso.",
    };
  }

  private async getOfferAndPreference(offerId: string, preferenceId: string) {
    const [offer, preference] = await Promise.all([
      prisma.offer.findUnique({
        where: {
          id: offerId,
        },
      }),
      prisma.preference.findUnique({
        where: {
          id: preferenceId,
        },
      }),
    ]);

    if (!offer) {
      throw new AppError("Oferta não encontrada", 404);
    }

    if (!preference) {
      throw new AppError("Preferência não encontrada", 404);
    }

    return {
      offer,
      preference,
    };
  }

  private async buildCandidatePairs(
    userId: string,
    offerId?: string,
    preferenceId?: string,
  ) {
    const pairs: Array<{
      offer: Offer;
      preference: Preference;
    }> = [];

    if (offerId) {
      const offer = await prisma.offer.findFirst({
        where: {
          id: offerId,
          userId,
        },
      });

      if (!offer) {
        throw new AppError("Oferta não encontrada para este usuário", 404);
      }

      const preferences = await prisma.preference.findMany({
        where: {
          isActive: true,
          userId: {
            not: userId,
          },
          city: {
            equals: offer.city,
            mode: "insensitive",
          },
          state: {
            equals: offer.state,
            mode: "insensitive",
          },
        },
      });

      for (const preference of preferences) {
        pairs.push({
          offer,
          preference,
        });
      }

      return this.removeDuplicatedPairs(pairs);
    }

    if (preferenceId) {
      const preference = await prisma.preference.findFirst({
        where: {
          id: preferenceId,
          userId,
          isActive: true,
        },
      });

      if (!preference) {
        throw new AppError("Preferência não encontrada para este usuário", 404);
      }

      const offers = await prisma.offer.findMany({
        where: {
          status: OfferStatus.ATIVA,
          userId: {
            not: userId,
          },
          city: {
            equals: preference.city,
            mode: "insensitive",
          },
          state: {
            equals: preference.state,
            mode: "insensitive",
          },
        },
      });

      for (const offer of offers) {
        pairs.push({
          offer,
          preference,
        });
      }

      return this.removeDuplicatedPairs(pairs);
    }

    return pairs;
  }

  private calculateMatch(
    offer: Offer,
    preference: Preference,
    minScore = DEFAULT_MIN_SCORE,
  ): MatchEvaluation {
    const reasons: string[] = [];

    const location = this.calculateLocationScore(offer, preference);
    const price = this.calculatePriceScore(offer, preference);
    const propertyType = this.calculatePropertyTypeScore(offer, preference);
    const specs = this.calculateSpecsScore(offer, preference);
    const amenities = this.calculateAmenitiesScore(offer, preference);

    const score = this.clamp(
      location.score +
        price.score +
        propertyType.score +
        specs.score +
        amenities.score,
      0,
      100,
    );

    const isCityAndStateCompatible =
      this.normalize(offer.city) === this.normalize(preference.city) &&
      this.normalize(offer.state) === this.normalize(preference.state);

    const isEligible =
      offer.status === OfferStatus.ATIVA &&
      preference.isActive &&
      offer.userId !== preference.userId &&
      isCityAndStateCompatible;

    if (offer.status !== OfferStatus.ATIVA) {
      reasons.push("Oferta não está ativa.");
    }

    if (!preference.isActive) {
      reasons.push("Preferência não está ativa.");
    }

    if (offer.userId === preference.userId) {
      reasons.push("A oferta e a preferência pertencem ao mesmo usuário.");
    }

    if (!isCityAndStateCompatible) {
      reasons.push("Cidade ou estado não correspondem.");
    }

    if (score < minScore) {
      reasons.push(`Score abaixo do mínimo configurado: ${minScore}.`);
    }

    return {
      score,
      classification: this.classifyScore(score),
      isEligible,
      shouldCreateMatch: isEligible && score >= minScore,
      reasons,
      breakdown: {
        location,
        price,
        propertyType,
        specs,
        amenities,
      },
    };
  }

  private calculateLocationScore(
    offer: Offer,
    preference: Preference,
  ): ScoreDetail {
    let score = 0;
    const details: string[] = [];

    const sameState =
      this.normalize(offer.state) === this.normalize(preference.state);

    const sameCity =
      this.normalize(offer.city) === this.normalize(preference.city);

    if (sameState) {
      score += 5;
      details.push("Estado compatível: +5");
    } else {
      details.push("Estado diferente: +0");
    }

    if (sameCity) {
      score += 10;
      details.push("Cidade compatível: +10");
    } else {
      details.push("Cidade diferente: +0");
    }

    if (!preference.neighborhoods || preference.neighborhoods.length === 0) {
      score += 10;
      details.push("Sem restrição de bairro: +10");
    } else {
      const neighborhoodMatches = preference.neighborhoods.some(
        (neighborhood) =>
          this.normalize(neighborhood) === this.normalize(offer.neighborhood),
      );

      if (neighborhoodMatches) {
        score += 10;
        details.push("Bairro compatível: +10");
      } else {
        details.push("Bairro fora da lista desejada: +0");
      }
    }

    return {
      score,
      max: 25,
      details,
    };
  }

  private calculatePriceScore(
    offer: Offer,
    preference: Preference,
  ): ScoreDetail {
    const offerPrice = this.toNumber(offer.price);
    const minPrice = this.toOptionalNumber(preference.minPrice);
    const maxPrice = this.toOptionalNumber(preference.maxPrice);

    const score = this.calculateRangeScore({
      value: offerPrice,
      min: minPrice,
      max: maxPrice,
      weight: 25,
      toleranceRate: 0.2,
    });

    const details: string[] = [];

    if (minPrice === null && maxPrice === null) {
      details.push("Sem restrição de preço: +25");
    } else if (score === 25) {
      details.push("Preço dentro da faixa desejada: +25");
    } else if (score > 0) {
      details.push(`Preço próximo da faixa desejada: +${score}`);
    } else {
      details.push("Preço fora da faixa desejada: +0");
    }

    return {
      score,
      max: 25,
      details,
    };
  }

  private calculatePropertyTypeScore(
    offer: Offer,
    preference: Preference,
  ): ScoreDetail {
    const details: string[] = [];

    if (!preference.propertyTypes || preference.propertyTypes.length === 0) {
      details.push("Sem restrição de tipo de imóvel: +15");

      return {
        score: 15,
        max: 15,
        details,
      };
    }

    const matches = preference.propertyTypes.includes(
      offer.propertyType as PropertyType,
    );

    if (matches) {
      details.push("Tipo de imóvel compatível: +15");
    } else {
      details.push("Tipo de imóvel incompatível: +0");
    }

    return {
      score: matches ? 15 : 0,
      max: 15,
      details,
    };
  }

  private calculateSpecsScore(
    offer: Offer,
    preference: Preference,
  ): ScoreDetail {
    const areaScore = this.calculateRangeScore({
      value: offer.areaM2,
      min: preference.minAreaM2,
      max: preference.maxAreaM2,
      weight: 8,
      toleranceRate: 0.2,
    });

    const bedroomScore = this.calculateMinimumScore(
      offer.bedrooms,
      preference.minBedrooms,
      4,
    );

    const bathroomScore = this.calculateMinimumScore(
      offer.bathrooms,
      preference.minBathrooms,
      4,
    );

    const parkingScore = this.calculateMinimumScore(
      offer.parkingSpots,
      preference.minParkingSpots,
      4,
    );

    const score = this.clamp(
      areaScore + bedroomScore + bathroomScore + parkingScore,
      0,
      20,
    );

    return {
      score,
      max: 20,
      details: [
        `Área: +${areaScore}`,
        `Quartos: +${bedroomScore}`,
        `Banheiros: +${bathroomScore}`,
        `Vagas: +${parkingScore}`,
      ],
    };
  }

  private calculateAmenitiesScore(
    offer: Offer,
    preference: Preference,
  ): ScoreDetail {
    const desiredAmenities = preference.desiredAmenities ?? [];

    if (desiredAmenities.length === 0) {
      return {
        score: 15,
        max: 15,
        details: ["Sem restrição de comodidades: +15"],
      };
    }

    const matchedAmenities = desiredAmenities.filter((amenity) =>
      offer.amenities.includes(amenity as Amenity),
    );

    const ratio = matchedAmenities.length / desiredAmenities.length;
    const score = this.round(ratio * 15);

    return {
      score,
      max: 15,
      details: [
        `${matchedAmenities.length}/${desiredAmenities.length} comodidades encontradas: +${score}`,
        `Encontradas: ${
          matchedAmenities.length > 0 ? matchedAmenities.join(", ") : "nenhuma"
        }`,
      ],
    };
  }

  private calculateRangeScore({
    value,
    min,
    max,
    weight,
    toleranceRate,
  }: {
    value: number;
    min: number | null;
    max: number | null;
    weight: number;
    toleranceRate: number;
  }) {
    if (min === null && max === null) {
      return weight;
    }

    if (min !== null && value < min) {
      const tolerance = Math.max(min * toleranceRate, 1);
      const distance = min - value;
      const ratio = 1 - distance / tolerance;

      return this.round(this.clamp(ratio, 0, 1) * weight);
    }

    if (max !== null && value > max) {
      const tolerance = Math.max(max * toleranceRate, 1);
      const distance = value - max;
      const ratio = 1 - distance / tolerance;

      return this.round(this.clamp(ratio, 0, 1) * weight);
    }

    return weight;
  }

  private calculateMinimumScore(
    actual: number,
    minimum: number | null,
    weight: number,
  ) {
    if (minimum === null || minimum === 0) {
      return weight;
    }

    if (actual >= minimum) {
      return weight;
    }

    return this.round(this.clamp(actual / minimum, 0, 1) * weight);
  }

  private ensureUserCanAccessPair(
    userId: string,
    offer: Offer,
    preference: Preference,
  ) {
    const userOwnsOffer = offer.userId === userId;
    const userOwnsPreference = preference.userId === userId;

    if (!userOwnsOffer && !userOwnsPreference) {
      throw new AppError(
        "Usuário não tem permissão para avaliar este match",
        403,
      );
    }
  }

  private removeDuplicatedPairs(
    pairs: Array<{
      offer: Offer;
      preference: Preference;
    }>,
  ) {
    const map = new Map<
      string,
      {
        offer: Offer;
        preference: Preference;
      }
    >();

    for (const pair of pairs) {
      if (pair.offer.userId === pair.preference.userId) {
        continue;
      }

      const key = `${pair.offer.id}:${pair.preference.id}`;
      map.set(key, pair);
    }

    return Array.from(map.values());
  }

  private classifyScore(score: number) {
    if (score >= 85) {
      return "EXCELENTE";
    }

    if (score >= 70) {
      return "BOM";
    }

    if (score >= 60) {
      return "MEDIO";
    }

    return "BAIXO";
  }

  private normalize(value: string) {
    return value
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  private toNumber(value: unknown) {
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

  private toOptionalNumber(value: unknown) {
    if (value === null || value === undefined) {
      return null;
    }

    return this.toNumber(value);
  }

  private clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
  }

  private round(value: number) {
    return Number(value.toFixed(2));
  }
}
