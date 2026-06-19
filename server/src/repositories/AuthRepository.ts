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


    async getByIdWithPassword(id: string): Promise<User | null> {
        return await this.prisma.user.findUnique({
            where: { id }
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

    async createNotification(userId: string, title: string, description: string, type = "new_compatible") {
        return await this.prisma.notification.create({
            data: {
                userId,
                type,
                title,
                description,
            }
        });
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


    async getProfileDetails(userId: string) {
        return await this.prisma.userProfile.findUnique({
            where: { userId }
        });
    }

    async upsertProfileDetails(userId: string, data: Prisma.UserProfileUncheckedUpdateInput) {
        return await this.prisma.userProfile.upsert({
            where: { userId },
            create: {
                ...(data as Prisma.UserProfileUncheckedCreateInput),
                userId,
            },
            update: data,
        });
    }


    async createPasswordRecoveryCode(userId: string, codeHash: string, expiresAt: Date) {
        return await this.prisma.passwordRecoveryCode.create({
            data: { userId, codeHash, expiresAt }
        });
    }

    async getLatestPasswordRecoveryCode(userId: string) {
        return await this.prisma.passwordRecoveryCode.findFirst({
            where: { userId, usedAt: null, expiresAt: { gt: new Date() } },
            orderBy: { createdAt: "desc" }
        });
    }

    async markPasswordRecoveryCodeUsed(id: string) {
        return await this.prisma.passwordRecoveryCode.update({
            where: { id },
            data: { usedAt: new Date() }
        });
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