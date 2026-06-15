import { z } from "zod";
import { MatchStatus } from "@prisma/client";

const idSchema = z.string().uuid("ID inválido");

const minScoreSchema = z.coerce
  .number()
  .min(0, "O score mínimo não pode ser menor que 0")
  .max(100, "O score mínimo não pode ser maior que 100")
  .optional();

export const EvaluateMatchSchema = z.object({
  body: z.object({
    offerId: idSchema,
    preferenceId: idSchema,
  }),
});

export const CreateMatchSchema = z.object({
  body: z.object({
    offerId: idSchema,
    preferenceId: idSchema,
    minScore: minScoreSchema,
  }),
});

export const GenerateMatchesSchema = z.object({
  body: z
    .object({
      offerId: idSchema.optional(),
      preferenceId: idSchema.optional(),
      minScore: minScoreSchema,
    })
    .refine((data) => data.offerId || data.preferenceId, {
      message: "Informe offerId ou preferenceId para gerar matches",
      path: ["offerId"],
    }),
});

export const ListMatchesSchema = z.object({
  query: z.object({
    status: z.nativeEnum(MatchStatus).optional(),
    minScore: minScoreSchema,
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
});

export const MatchIdParamsSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
});

export const UpdateMatchStatusSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
  body: z.object({
    status: z.nativeEnum(MatchStatus),
  }),
});
