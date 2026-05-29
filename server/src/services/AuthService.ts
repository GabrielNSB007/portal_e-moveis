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
    ) : Promise<string> {
        const dbUser = await this.authRepository.getByEmail(email);
        if (dbUser) throw new Error(MessagesEnum.ERROR_EMAIL_ALREADY_REGISTERED);

        password = await bcrypt.hash(password, SystemConstantsEnum.BCRYPT_SALT_ROUNDS);
        const newUser = await this.authRepository.create(email, password, name);

        const token = generateAccessToken(newUser.id);
        return token;
    }

    async profileData(userId: string) {
        const user = await this.authRepository.getById(userId);
        if (!user) throw new Error(MessagesEnum.ERROR_USER_NOT_FOUND);

        return user;
    }
}