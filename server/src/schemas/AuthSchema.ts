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
    phone: z.string().optional(),
  }),
});

export type LoginSchemaType = z.infer<typeof LoginSchema>["body"];
export type RegisterSchemaType = z.infer<typeof RegisterSchema>["body"];
export type UpdateUserSchemaType = z.infer<typeof UpdateUserSchema>["body"];
