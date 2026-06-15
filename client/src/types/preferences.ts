import { z } from "zod";

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
  "PLAYGROUND",
  "PORTARIA_24H",
] as const;

const preferenceFieldsSchema = z.object({
  title: z.string().optional(),

  minPrice: z.coerce
    .number()
    .nonnegative("O valor não pode ser negativo")
    .optional(),

  maxPrice: z.coerce
    .number()
    .nonnegative("O valor não pode ser negativo")
    .optional(),

  minAreaM2: z.coerce
    .number()
    .nonnegative("O valor não pode ser negativo")
    .optional(),

  maxAreaM2: z.coerce
    .number()
    .nonnegative("O valor não pode ser negativo")
    .optional(),

  minBedrooms: z.coerce
    .number()
    .int("O valor deve ser inteiro")
    .nonnegative("O valor não pode ser negativo")
    .optional(),

  minBathrooms: z.coerce
    .number()
    .int("O valor deve ser inteiro")
    .nonnegative("O valor não pode ser negativo")
    .optional(),

  minParkingSpots: z.coerce
    .number()
    .int("O valor deve ser inteiro")
    .nonnegative("O valor não pode ser negativo")
    .optional(),

  propertyTypes: z.array(z.enum(propertyTypes)).default([]),

  neighborhoods: z.array(z.string()).default([]),

  city: z.string().min(1, "Este é um campo obrigatório."),

  state: z.string().min(1, "Este é um campo obrigatório."),

  desiredAmenities: z.array(z.enum(amenities)).default([]),

  isActive: z.boolean().optional(),
});

function validatePreferenceRanges(
  data: {
    minPrice?: number;
    maxPrice?: number;
    minAreaM2?: number;
    maxAreaM2?: number;
  },
  ctx: z.RefinementCtx,
) {
  if (
    data.minPrice !== undefined &&
    data.maxPrice !== undefined &&
    data.minPrice > data.maxPrice
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["maxPrice"],
      message: "O preço máximo deve ser maior ou igual ao preço mínimo",
    });
  }

  if (
    data.minAreaM2 !== undefined &&
    data.maxAreaM2 !== undefined &&
    data.minAreaM2 > data.maxAreaM2
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["maxAreaM2"],
      message: "A área máxima deve ser maior ou igual à área mínima",
    });
  }
}

export const createPreferenceSchema = z.object({
  title: preferenceFieldsSchema.shape.title,
  minPrice: preferenceFieldsSchema.shape.minPrice,
  maxPrice: preferenceFieldsSchema.shape.maxPrice,
  minAreaM2: preferenceFieldsSchema.shape.minAreaM2,
  maxAreaM2: preferenceFieldsSchema.shape.maxAreaM2,
  minBedrooms: preferenceFieldsSchema.shape.minBedrooms,
  minBathrooms: preferenceFieldsSchema.shape.minBathrooms,
  minParkingSpots: preferenceFieldsSchema.shape.minParkingSpots,
  propertyTypes: preferenceFieldsSchema.shape.propertyTypes,
  neighborhoods: preferenceFieldsSchema.shape.neighborhoods,
  city: preferenceFieldsSchema.shape.city,
  state: preferenceFieldsSchema.shape.state,
  desiredAmenities: preferenceFieldsSchema.shape.desiredAmenities,
  isActive: preferenceFieldsSchema.shape.isActive,
}).superRefine(validatePreferenceRanges);

export const updatePreferenceSchema =
  createPreferenceSchema.partial().superRefine(validatePreferenceRanges);

export type CreatePreferenceFormData =
  z.infer<typeof createPreferenceSchema>;

export type UpdatePreferenceFormData =
  z.infer<typeof updatePreferenceSchema>;