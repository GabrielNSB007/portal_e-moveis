import { z } from "zod";

export const matchStatuses = [
  "PENDENTE",
  "VISUALIZADO",
  "PROPOSTA_ENVIADA",
  "RECUSADO",
  "FEITO",
] as const;

export const matchClassifications = [
  "EXCELENTE",
  "BOM",
  "MEDIO",
  "BAIXO",
] as const;

export const propertyTypes = [
  "APARTAMENTO",
  "CASA",
  "STUDIO",
  "COBERTURA",
  "TERRENO",
] as const;

export const amenities = [
  "PISCINA",
  "ACADEMIA",
  "CHURRASQUEIRA",
  "ELEVADOR",
  "PORTARIA",
  "MOBILIADO",
  "PET_FRIENDLY",
  "VARANDA",
  "AREA_SERVICO",
] as const;

export const mediaTypes = ["FOTO", "VIDEO"] as const;

export const offerStatuses = [
  "ATIVA",
  "PAUSADA",
  "VENDIDA",
  "EXPIRADA",
] as const;

export const userRoles = ["CLIENTE", "VENDEDOR"] as const;

export const decimalLikeSchema = z.union([z.number(), z.string()]);

export const dateTimeStringSchema = z.string();

export const matchStatusSchema = z.enum(matchStatuses);

export const matchClassificationSchema = z.enum(matchClassifications);

export const propertyTypeSchema = z.enum(propertyTypes);

export const amenitySchema = z.enum(amenities);

export const mediaTypeSchema = z.enum(mediaTypes);

export const offerStatusSchema = z.enum(offerStatuses);

export const userRoleSchema = z.enum(userRoles);

export const scoreDetailSchema = z.object({
  score: z.number(),
  max: z.number(),
  details: z.array(z.string()),
});

export const matchBreakdownSchema = z.object({
  location: scoreDetailSchema,
  price: scoreDetailSchema,
  propertyType: scoreDetailSchema,
  specs: scoreDetailSchema,
  amenities: scoreDetailSchema,
});

export const matchEvaluationSchema = z.object({
  score: z.number(),
  classification: matchClassificationSchema,
  isEligible: z.boolean(),
  shouldCreateMatch: z.boolean(),
  reasons: z.array(z.string()),
  breakdown: matchBreakdownSchema,
});

export const userSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string().nullable().optional(),
  role: userRoleSchema,
});

export const matchOfferMediaSchema = z.object({
  id: z.string(),
  url: z.string(),
  type: mediaTypeSchema,
  offerId: z.string(),
  createdAt: dateTimeStringSchema,
});

export const matchOfferSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  price: decimalLikeSchema,
  areaM2: z.number(),
  bedrooms: z.number(),
  bathrooms: z.number(),
  parkingSpots: z.number(),
  propertyType: propertyTypeSchema,
  status: offerStatusSchema,
  neighborhood: z.string(),
  city: z.string(),
  state: z.string(),
  address: z.string().nullable().optional(),
  amenities: z.array(amenitySchema),
  userId: z.string(),
  user: userSummarySchema.optional(),
  media: z.array(matchOfferMediaSchema).optional(),
  createdAt: dateTimeStringSchema,
  updatedAt: dateTimeStringSchema,
});

export const matchPreferenceSchema = z.object({
  id: z.string(),
  userId: z.string(),
  user: userSummarySchema.optional(),
  title: z.string().nullable().optional(),
  minPrice: decimalLikeSchema.nullable().optional(),
  maxPrice: decimalLikeSchema.nullable().optional(),
  minAreaM2: z.number().nullable().optional(),
  maxAreaM2: z.number().nullable().optional(),
  minBedrooms: z.number().nullable().optional(),
  minBathrooms: z.number().nullable().optional(),
  minParkingSpots: z.number().nullable().optional(),
  propertyTypes: z.array(propertyTypeSchema),
  neighborhoods: z.array(z.string()),
  city: z.string(),
  state: z.string(),
  desiredAmenities: z.array(amenitySchema),
  isActive: z.boolean(),
  createdAt: dateTimeStringSchema,
  updatedAt: dateTimeStringSchema,
});

export const readDeleteMatchSchema = z.object({
  id: z.string(),
  offerId: z.string(),
  preferenceId: z.string(),
  score: z.number(),
  status: matchStatusSchema,
  offer: matchOfferSchema.optional(),
  preference: matchPreferenceSchema.optional(),
  createdAt: dateTimeStringSchema,
  updatedAt: dateTimeStringSchema,
});

export const evaluateMatchSchema = z.object({
  offerId: z.string().uuid("O id do imóvel deve ser um UUID válido"),
  preferenceId: z.string().uuid("O id da preferência deve ser um UUID válido"),
});

export const createMatchSchema = evaluateMatchSchema.extend({
  minScore: z.coerce
    .number()
    .min(0, "O score mínimo não pode ser menor que 0")
    .max(100, "O score mínimo não pode ser maior que 100")
    .optional(),
});

export const generateMatchesSchema = z
  .object({
    offerId: z
      .string()
      .uuid("O id do imóvel deve ser um UUID válido")
      .optional(),

    preferenceId: z
      .string()
      .uuid("O id da preferência deve ser um UUID válido")
      .optional(),

    minScore: z.coerce
      .number()
      .min(0, "O score mínimo não pode ser menor que 0")
      .max(100, "O score mínimo não pode ser maior que 100")
      .optional(),
  })
  .refine((data) => data.offerId || data.preferenceId, {
    message: "Informe offerId ou preferenceId para gerar matches",
  });

export const updateMatchStatusSchema = z.object({
  status: matchStatusSchema,
});

export const listMatchesParamsSchema = z.object({
  status: matchStatusSchema.optional(),

  minScore: z.coerce
    .number()
    .min(0, "O score mínimo não pode ser menor que 0")
    .max(100, "O score mínimo não pode ser maior que 100")
    .optional(),

  page: z.coerce
    .number()
    .int("A página deve ser um número inteiro")
    .positive("A página deve ser maior que zero")
    .optional(),

  limit: z.coerce
    .number()
    .int("O limite deve ser um número inteiro")
    .positive("O limite deve ser maior que zero")
    .optional(),
});

export const createMatchResponseSchema = z.object({
  createdOrUpdated: z.boolean(),
  match: readDeleteMatchSchema.nullable(),
  evaluation: matchEvaluationSchema,
  message: z.string(),
});

export const generateMatchesResponseSchema = z.object({
  createdOrUpdated: z.number(),
  skipped: z.number(),
  matches: z.array(readDeleteMatchSchema),
  evaluations: z.array(matchEvaluationSchema),
});

export const listMatchesResponseSchema = z.object({
  items: z.array(readDeleteMatchSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const deleteMatchResponseSchema = z.object({
  message: z.string(),
});

export type MatchStatus = z.infer<typeof matchStatusSchema>;

export type MatchClassification = z.infer<typeof matchClassificationSchema>;

export type PropertyType = z.infer<typeof propertyTypeSchema>;

export type Amenity = z.infer<typeof amenitySchema>;

export type MediaType = z.infer<typeof mediaTypeSchema>;

export type DecimalLike = z.infer<typeof decimalLikeSchema>;

export type DateTimeString = z.infer<typeof dateTimeStringSchema>;

export type ScoreDetail = z.infer<typeof scoreDetailSchema>;

export type MatchBreakdown = z.infer<typeof matchBreakdownSchema>;

export type MatchEvaluation = z.infer<typeof matchEvaluationSchema>;

export type UserSummary = z.infer<typeof userSummarySchema>;

export type MatchOfferMedia = z.infer<typeof matchOfferMediaSchema>;

export type MatchOffer = z.infer<typeof matchOfferSchema>;

export type MatchPreference = z.infer<typeof matchPreferenceSchema>;

export type ReadDeleteMatch = z.infer<typeof readDeleteMatchSchema>;

export type EvaluateMatch = z.infer<typeof evaluateMatchSchema>;

export type CreateMatch = z.infer<typeof createMatchSchema>;

export type GenerateMatches = z.infer<typeof generateMatchesSchema>;

export type UpdateMatchStatus = z.infer<typeof updateMatchStatusSchema>;

export type ListMatchesParams = z.infer<typeof listMatchesParamsSchema>;

export type CreateMatchResponse = z.infer<typeof createMatchResponseSchema>;

export type GenerateMatchesResponse = z.infer<
  typeof generateMatchesResponseSchema
>;

export type ListMatchesResponse = z.infer<typeof listMatchesResponseSchema>;

export type DeleteMatchResponse = z.infer<typeof deleteMatchResponseSchema>;