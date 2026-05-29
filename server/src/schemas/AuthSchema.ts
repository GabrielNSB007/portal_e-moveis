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
    })
})

export const UpdateUserSchema = z.object({
    body: z.object({
        email: z.string().email().optional(),
        name: z.string().min(1).optional(),
        password: z.string().min(6).optional(),
    })
})

export type LoginSchemaType = z.infer<typeof LoginSchema.shape.body>;
export type RegisterSchemaType = z.infer<typeof RegisterSchema.shape.body>;
export type UpdateUserSchemaType = z.infer<typeof UpdateUserSchema.shape.body>;