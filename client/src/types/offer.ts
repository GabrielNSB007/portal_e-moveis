import { z } from "zod";

export const propertyTypes = [
  "APARTAMENTO",
  "CASA",
  "STUDIO",
  "COBERTURA",
  "TERRENO",
] as const;

export const offerStatuses = ["ATIVA", "PAUSADA", "FINALIZADA"] as const;

export const mediaTypes = ["IMAGE", "VIDEO"] as const;

export const offerMediaSchema = z.object({
  url: z.string().url("URL da mídia inválida."),

  type: z.enum(mediaTypes, {
    message: "O tipo da mídia é obrigatório.",
  }),
});

export const createOfferSchema = z.object({
  title: z.string().min(1, "Este é um campo obrigatório."),

  description: z.string().optional(),

  price: z
    .number({
      message: "Este é um campo obrigatório.",
    })
    .nonnegative("O preço não pode ser negativo."),

  areaM2: z
    .number({
      message: "Este é um campo obrigatório.",
    })
    .nonnegative("A área não pode ser negativa."),

  bedrooms: z
    .number({
      message: "Este é um campo obrigatório.",
    })
    .int()
    .nonnegative("Quantidade inválida."),

  bathrooms: z
    .number({
      message: "Este é um campo obrigatório.",
    })
    .int()
    .nonnegative("Quantidade inválida."),

  parkingSpots: z
    .number({
      message: "Este é um campo obrigatório.",
    })
    .int()
    .nonnegative("Quantidade inválida."),

  propertyType: z.enum(propertyTypes, {
    message: "Selecione um tipo de imóvel.",
  }),

  neighborhood: z.string().min(1, "Este é um campo obrigatório."),

  city: z.string().min(1, "Este é um campo obrigatório."),

  state: z.string().min(1, "Este é um campo obrigatório."),

  address: z.string().optional(),

  userId: z.string().min(1, "Usuário obrigatório."),

  media: z.array(offerMediaSchema).optional(),
});

export const updateOfferSchema = createOfferSchema.partial();

export type CreateOfferFormData = z.infer<typeof createOfferSchema>;
export type UpdateOfferFormData = z.infer<typeof updateOfferSchema>;
export type OfferMediaFormData = z.infer<typeof offerMediaSchema>;
