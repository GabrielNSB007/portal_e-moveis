import { z } from "zod";

export const CreateProposalSchema = z.object({
  body: z.object({
    offerId: z.string().uuid("O id do imóvel deve ser um UUID válido"),
    message: z
      .string()
      .trim()
      .min(1, "A mensagem não pode estar vazia")
      .max(1000, "A mensagem deve ter no máximo 1000 caracteres")
      .optional(),
    value: z.coerce
      .number()
      .positive("O valor da proposta deve ser maior que zero")
      .optional(),
  }),
});

export const UpdateProposalSchema = z.object({
  params: z.object({
    id: z.string().uuid("O id da proposta deve ser um UUID válido"),
  }),
  body: z
    .object({
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
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "Informe ao menos um campo para atualizar",
    }),
});

export const ProposalIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("O id da proposta deve ser um UUID válido"),
  }),
});

export const OfferIdParamSchema = z.object({
  params: z.object({
    offerId: z.string().uuid("O id do imóvel deve ser um UUID válido"),
  }),
});

export type CreateProposalBody = z.infer<typeof CreateProposalSchema>["body"];
export type UpdateProposalBody = z.infer<typeof UpdateProposalSchema>["body"];
export type ProposalIdParams = z.infer<typeof ProposalIdParamSchema>["params"];
export type OfferIdParams = z.infer<typeof OfferIdParamSchema>["params"];