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
        cpf: z.string().length(11, "CPF must be 11 characters").nonempty("CPF is required"),
        name: z.string().nonempty("Name is required"),
    })
})

export type LoginSchemaType = z.infer<typeof LoginSchema.shape.body>;
export type RegisterSchemaType = z.infer<typeof RegisterSchema.shape.body>;