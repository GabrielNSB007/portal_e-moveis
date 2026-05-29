import { type Request, type Response } from "express";
import { HttpStatusEnum } from "../shared/enums/httpStatusEnum.js";
import { AuthService } from "../services/AuthService.js";
import { LoginSchemaType, RegisterSchemaType } from "../schemas/AuthSchema.js";

export class AuthController {
    constructor(private authService: AuthService = new AuthService()) {}

    async login (req: Request<{}, {}, LoginSchemaType>, res: Response) {
        try {
            const { email, password } = req.body;
            const token = await this.authService.authUser(email, password);
            res.status(HttpStatusEnum.OK).json({token});
        } catch(err: any) {
            res.status(HttpStatusEnum.INVALID_CREDENTIALS).send({ error: err.message });
        }
    };

    async register (req: Request<{}, {}, RegisterSchemaType>, res: Response) {
        try {
            const { email, password, cpf, name } = req.body;
            const token = await this.authService.registerUser(email, password, cpf, name);
            res.status(HttpStatusEnum.CREATED).json({ token });
        } catch(err: any) {
            res.status(HttpStatusEnum.INTERNAL_SERVER_ERROR).send({ error: err.message });
        }
    }
}