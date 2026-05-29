import { UserRole } from "@prisma/client";
import { AuthRepository } from "../repositories/AuthRepository.js";
import { MessagesEnum } from "../shared/enums/messagesEnum.js";
import { SystemConstantsEnum } from "../shared/enums/systemConstantsEnum.js";
import { generateAccessToken } from "../utils/jwtUtils.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

export class AuthService {
    private authRepository = new AuthRepository();

    async authUser (email: string, password: string) : Promise<string> {
        const dbUser = await this.authRepository.getByEmail(email);

        if (!dbUser || !await bcrypt.compare(password, dbUser.password)) {
            throw new Error(MessagesEnum.ERROR_INVALID_CREDENTIALS);
        }
        const userId = dbUser.id;

        const token = generateAccessToken(userId);
        return token;
    }

    async registerUser(
        email: string,
        password: string,
        name: string,
        userRole: UserRole,
        phone?: string,
    ) : Promise<string> {
        const dbUser = await this.authRepository.getByEmail(email);
        if (dbUser) throw new Error(MessagesEnum.ERROR_EMAIL_ALREADY_REGISTERED);

        password = await bcrypt.hash(password, SystemConstantsEnum.BCRYPT_SALT_ROUNDS);
        const newUser = await this.authRepository.create(email, password, userRole, phone, name);

        const token = generateAccessToken(newUser.id);
        return token;
    }

    async profileData(userId: string) {
        const user = await this.authRepository.getById(userId);
        if (!user) throw new Error(MessagesEnum.ERROR_USER_NOT_FOUND);

        return user;
    }

    async updateUser(userId: string, email?: string, name?: string, password?: string, phone?: string) {
        const user = await this.authRepository.getById(userId);
        if (!user) throw new Error(MessagesEnum.ERROR_USER_NOT_FOUND);

        // Validar email único se for atualizado
        if (email && email !== user.email) {
            const existingUser = await this.authRepository.getByEmail(email);
            if (existingUser) throw new Error(MessagesEnum.ERROR_EMAIL_ALREADY_REGISTERED);
        }

        const updateData: any = {};
        if (email) updateData.email = email;
        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;
        if (password) {
            updateData.password = await bcrypt.hash(password, SystemConstantsEnum.BCRYPT_SALT_ROUNDS);
        }

        const updatedUser = await this.authRepository.update(userId, updateData);
        return updatedUser;
    }

    async deleteUser(userId: string) {
        const user = await this.authRepository.getById(userId);
        if (!user) throw new Error(MessagesEnum.ERROR_USER_NOT_FOUND);

        const deletedUser = await this.authRepository.delete(userId);
        return deletedUser;
    }
}