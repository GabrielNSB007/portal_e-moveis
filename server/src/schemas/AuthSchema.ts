import { z } from "zod";

export const LoginSchema = z.object({
    body: z.object({
        email: z.string().email().nonempty("Email is required"),
        password: z.string().min(6).nonempty("Password is required")
    })
})

export const RegisterSchema = z.object({
    body: z.object({
        email: z.string().email().nonempty("Email is required"),
        password: z.string().min(6).nonempty("Password is required"),
        name: z.string().nonempty("Name is required"),
        phone: z.string().optional(),
        userRole: z.string().optional() // Pode ser adicionado para permitir registro de diferentes tipos de usuários, ou pode ser removido para sempre usar o valor padrão
    })
})

export const UpdateUserSchema = z.object({
    body: z.object({
        email: z.string().email().optional(),
        name: z.string().min(1).optional(),
        password: z.string().min(6).optional(),
        phone: z.string().optional(),
    })
})

export type LoginSchemaType = z.infer<typeof LoginSchema.shape.body>;
export type RegisterSchemaType = z.infer<typeof RegisterSchema.shape.body>;
export type UpdateUserSchemaType = z.infer<typeof UpdateUserSchema.shape.body>;