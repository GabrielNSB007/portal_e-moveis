import { AuthRepository } from "../repositories/AuthRepository.js";
import dotenv from "dotenv";

dotenv.config();

export class AuthService {
    private authRepository = new AuthRepository();

    async authUser (email: string, password: string) : Promise<string> {
        const dbUser = await this.authRepository.getByEmail(email);
        const token = 'jwt';
        return token;
    }

    async registerUser(
        email: string,
        password: string,
        cpf: string,
        name: string,
    ) : Promise<string> {
        const dbUser = await this.authRepository.getByEmail(email);
        const token = 'jwt';
        return token;
    }
}