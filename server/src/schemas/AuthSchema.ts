import { z } from "zod";
import { UserRole } from "@prisma/client";

export const LoginSchema = z.object({
  body: z.object({
    email: z.string().email("Email inválido").nonempty("Email is required"),
    password: z.string().min(6).nonempty("Password is required"),
  }),
});

export const RegisterSchema = z.object({
  body: z.object({
    email: z.string().email("Email inválido").nonempty("Email is required"),
    password: z.string().min(6).nonempty("Password is required"),
    name: z.string().nonempty("Name is required"),
    phone: z.string().optional(),
    userRole: z.nativeEnum(UserRole).optional(),
  }),
});

export const UpdateUserSchema = z.object({
  body: z.object({
    email: z.string().email("Email inválido").optional(),
    name: z.string().min(1).optional(),
    password: z.string().min(6).optional(),
    currentPassword: z.string().min(6).optional(),
    phone: z.string().optional(),
    userRole: z.nativeEnum(UserRole).optional(),
  }),
});

export type LoginSchemaType = z.infer<typeof LoginSchema>["body"];
export type RegisterSchemaType = z.infer<typeof RegisterSchema>["body"];
export type UpdateUserSchemaType = z.infer<typeof UpdateUserSchema>["body"];


const nullableNumber = z.preprocess((value) => {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  return Number(value);
}, z.number().nonnegative().nullable().optional());

export const UpdateProfileDetailsSchema = z.object({
  body: z.object({
    avatarUrl: z.string().optional().nullable(),
    income: nullableNumber,
    downPayment: nullableNumber,
    needsFinancing: z.boolean().optional().nullable(),
    purchaseType: z.string().optional().nullable(),
    documentId: z.string().optional().nullable(),
  }),
});

export type UpdateProfileDetailsSchemaType = z.infer<typeof UpdateProfileDetailsSchema>["body"];


export const RequestPasswordRecoverySchema = z.object({
  body: z.object({
    email: z.string().email("Email inv?lido"),
  }),
});

export const ResetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Email inv?lido"),
    code: z.string().min(6),
    password: z.string().min(6),
  }),
});

export type RequestPasswordRecoverySchemaType = z.infer<typeof RequestPasswordRecoverySchema>["body"];
export type ResetPasswordSchemaType = z.infer<typeof ResetPasswordSchema>["body"];
