import { z } from "zod";
import { ProposalStatus } from "@prisma/client";

const idSchema = z.string().uuid("ID inválido");

const nullableMessageSchema = z.preprocess((value) => {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  return value;
}, z.string().trim().min(1, "A mensagem não pode estar vazia").max(1000, "A mensagem deve ter no máximo 1000 caracteres").nullable().optional());

const nullableValueSchema = z.preprocess(
  (value) => {
    if (value === undefined) return undefined;
    if (value === null || value === "") return null;
    return Number(value);
  },
  z
    .number({
      invalid_type_error: "O valor da proposta deve ser numérico",
    })
    .positive("O valor da proposta deve ser maior que zero")
    .nullable()
    .optional(),
);

export const CreateProposalSchema = z.object({
  body: z.object({
    offerId: idSchema,
    matchId: idSchema.nullable().optional(),
    message: nullableMessageSchema,
    value: nullableValueSchema,
  }),
});

export const UpdateProposalSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
  body: z
    .object({
      message: nullableMessageSchema,
      value: nullableValueSchema,
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "Informe ao menos um campo para atualizar",
    }),
});

export const UpdateProposalStatusSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
  body: z.object({
    status: z.nativeEnum(ProposalStatus),
  }),
});

export const ProposalIdParamSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
});

export const OfferIdParamSchema = z.object({
  params: z.object({
    offerId: idSchema,
  }),
});

export type CreateProposalBody = z.infer<typeof CreateProposalSchema>["body"];
export type UpdateProposalBody = z.infer<typeof UpdateProposalSchema>["body"];
export type UpdateProposalStatusBody = z.infer<
  typeof UpdateProposalStatusSchema
>["body"];
