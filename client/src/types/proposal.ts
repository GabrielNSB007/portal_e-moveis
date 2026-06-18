import { z } from "zod";

export const offerStatuses = [
  "ATIVA",
  "PAUSADA",
  "VENDIDA",
  "EXPIRADA",
] as const;

export const offerStatusSchema = z.enum(offerStatuses);

export const decimalLikeSchema = z.union([z.number(), z.string()]);

export const dateTimeStringSchema = z.string();

export const proposalBuyerSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string().nullable().optional(),
});

export const proposalOfferSchema = z.object({
  id: z.string(),
  title: z.string(),
  price: decimalLikeSchema,
  status: offerStatusSchema,
  userId: z.string(),
  neighborhood: z.string(),
  city: z.string(),
  state: z.string(),
});

export const readDeleteProposalSchema = z.object({
  id: z.string(),
  offerId: z.string(),
  buyerId: z.string(),
  message: z.string().nullable().optional(),
  value: decimalLikeSchema.nullable().optional(),
  createdAt: dateTimeStringSchema,
  buyer: proposalBuyerSchema,
  offer: proposalOfferSchema,
});

const proposalFieldsSchema = z.object({
  offerId: z.string().uuid("O id do imóvel deve ser um UUID válido"),

  message: z
    .string()
    .trim()
    .min(1, "A mensagem não pode estar vazia")
    .max(1000, "A mensagem deve ter no máximo 1000 caracteres")
    .nullable()
    .optional(),

  value: z.coerce
    .number()
    .positive("O valor da proposta deve ser maior que zero")
    .nullable()
    .optional(),
});

export const createProposalSchema = z.object({
  offerId: proposalFieldsSchema.shape.offerId,
  message: proposalFieldsSchema.shape.message,
  value: proposalFieldsSchema.shape.value,
});

export const updateProposalSchema = z
  .object({
    message: proposalFieldsSchema.shape.message,
    value: proposalFieldsSchema.shape.value,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualizar",
  });

export const deleteProposalResponseSchema = z.object({
  message: z.string(),
  proposal: readDeleteProposalSchema,
});

export type DecimalLike = z.infer<typeof decimalLikeSchema>;

export type DateTimeString = z.infer<typeof dateTimeStringSchema>;

export type OfferStatus = z.infer<typeof offerStatusSchema>;

export type ProposalBuyer = z.infer<typeof proposalBuyerSchema>;

export type ProposalOffer = z.infer<typeof proposalOfferSchema>;

export type ReadDeleteProposal = z.infer<typeof readDeleteProposalSchema>;

export type CreateProposalFormData = z.infer<typeof createProposalSchema>;

export type UpdateProposalFormData = z.infer<typeof updateProposalSchema>;

export type DeleteProposalResponse = z.infer<
  typeof deleteProposalResponseSchema
>;