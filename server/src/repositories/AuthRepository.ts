import { PrismaClient, type User, Prisma, UserRole } from "@prisma/client";

export type SafeUser = {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}

export class AuthRepository {
    private prisma = new PrismaClient();

    async getByEmail (email: string) : Promise<User | null> {
        return await this.prisma.user.findUnique({
            where: { email: email }
        })
    }

    async getById(id: string): Promise<SafeUser | null> {
        return await this.prisma.user.findUnique({
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
            where: { id: id }
        });
    }

    async create (
        email: string,
        password: string,
        role: UserRole,
        phone: string | undefined,
        name: string,
    ) : Promise<User>  {
        return await this.prisma.user.create({
            data: {
                email: email,
                password: password,
                name: name,
                role: role,
                phone: phone,
            }
        })
    }

    async update(id: string, data: Partial<User>): Promise<SafeUser> {
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            }
        });
        return updatedUser;
    }

    async delete(id: string): Promise<SafeUser> {
        if (!id) {
            throw new Error("ID is required");
        }
        const deletedUser = await this.prisma.user.delete({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            }
        });
        return deletedUser;
    }
}