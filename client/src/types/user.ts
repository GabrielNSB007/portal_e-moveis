import { z } from "zod";

export const loginUserSchema = z.object({
    email: z.string().email("Email inválido").nonempty("Email é obrigatório"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export const registerUserSchema = z.object({
    email: z.string().email("Email inválido").nonempty("Email é obrigatório"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    name: z.string().nonempty("Nome é obrigatório"),
    phone: z.string().optional(),
    userRole: z.string().optional(),
});

export const updateUserSchema = z.object({
    email: z.string().email("Email inválido").optional(),
    name: z.string().min(1, "Nome é obrigatório").optional(),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres").optional(),
    phone: z.string().optional(),
});

export const readUserSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
    phone: z.string().nullable().optional(),
    userRole: z.string().optional(),
});

export const authResponseSchema = z.object({
    token: z.string(),
});

export type LoginUser = z.infer<typeof loginUserSchema>;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type ReadUser = z.infer<typeof readUserSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;