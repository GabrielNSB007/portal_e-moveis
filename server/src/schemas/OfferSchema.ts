import { z } from "zod";
import { Amenity, MediaType, OfferStatus, PropertyType } from "@prisma/client";

const idSchema = z.string().uuid("ID inválido");

const optionalString = z.preprocess((value) => {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  return value;
}, z.string().trim().min(1).nullable().optional());

const requiredString = (message: string) => z.string().trim().min(1, message);

const mediaUrlSchema = z.string().trim().min(1, "URL da mídia é obrigatória").refine((value) => {
  return /^https?:\/\//i.test(value) || /^data:image\/(png|jpe?g|webp);base64,/i.test(value);
}, "A mídia deve ser uma URL http(s) ou uma imagem PNG/JPG/WebP enviada.");

const numberSchema = z.coerce
  .number({
    invalid_type_error: "O valor deve ser numérico",
  })
  .positive("O valor deve ser maior que zero");

const integerSchema = z.coerce
  .number()
  .int("O valor deve ser inteiro")
  .nonnegative("O valor não pode ser negativo");

const mediaSchema = z.object({
  url: z.string().url("URL da mídia inválida"),
  type: z.nativeEnum(MediaType),
});

const offerFieldsSchema = z.object({
  title: requiredString("Título é obrigatório"),
  description: optionalString,

  price: numberSchema,
  areaM2: numberSchema,

  bedrooms: integerSchema,
  bathrooms: integerSchema,
  parkingSpots: integerSchema,

  propertyType: z.nativeEnum(PropertyType),
  status: z.nativeEnum(OfferStatus).optional(),

  neighborhood: requiredString("Bairro é obrigatório"),
  city: requiredString("Cidade é obrigatória"),
  state: requiredString("Estado é obrigatório"),
  address: optionalString,

  amenities: z.array(z.nativeEnum(Amenity)).default([]),
  media: z.array(mediaSchema).default([]),
});

export const CreateOfferSchema = z.object({
  body: offerFieldsSchema,
});

export const UpdateOfferSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
  body: offerFieldsSchema.partial(),
});

export const OfferIdParamsSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
});

export const ListOffersSchema = z.object({
  query: z.object({
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    status: z.nativeEnum(OfferStatus).optional(),
    propertyType: z.nativeEnum(PropertyType).optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(1000).optional(),
  }),
});

export type CreateOfferBody = z.infer<typeof CreateOfferSchema>["body"];
export type UpdateOfferBody = z.infer<typeof UpdateOfferSchema>["body"];
export type ListOffersQuery = z.infer<typeof ListOffersSchema>["query"];
