import { PrismaClient, type User, Prisma } from "@prisma/client";

export type SafeUser = {
    id: string;
    name: string;
    email: string;
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
            },
            where: { id: id }
        });
    }

    async create (
        email: string,
        password: string,
        name: string,
    ) : Promise<User>  {
        return await this.prisma.user.create({
            data: {
                email: email,
                password: password,
                name: name,
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
            }
        });
        return updatedUser;
    }

    async delete(id: string): Promise<SafeUser> {
        const deletedUser = await this.prisma.user.delete({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
            }
        });
        return deletedUser;
    }
}