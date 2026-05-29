import { type Request, type Response } from "express";
import { HttpStatusEnum } from "../shared/enums/httpStatusEnum.js";
import { MessagesEnum } from "../shared/enums/messagesEnum.js";
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
            const { email, password, name } = req.body;
            const token = await this.authService.registerUser(email, password, name);
            res.status(HttpStatusEnum.CREATED).json({ token });
        } catch(err: any) {
            // Email já registrado
            if (err.message.includes("Unique constraint failed") || err.message === MessagesEnum.ERROR_EMAIL_ALREADY_REGISTERED) {
                return res.status(HttpStatusEnum.UNPROCESSABLE_ENTITY).send({ error: MessagesEnum.ERROR_EMAIL_ALREADY_REGISTERED });
            }
            // Qualquer outro erro
            res.status(HttpStatusEnum.INTERNAL_SERVER_ERROR).send({ error: err.message || MessagesEnum.ERROR_SERVER });
        }
    }

    async profile (req: Request, res: Response) {
        try {
            const userId = res.locals.userId;
            const userData = await this.authService.profileData(userId);
            res.status(HttpStatusEnum.OK).json(userData);
        } catch(err: any) {
            res.status(HttpStatusEnum.INTERNAL_SERVER_ERROR).send({ error: err.message });
        }
    }
}