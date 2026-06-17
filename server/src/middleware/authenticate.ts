import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { verifyToken } from "../utils/jwtUtils.js";
import { MessagesEnum } from "../shared/enums/messagesEnum.js";
import { HttpStatusEnum } from "../shared/enums/httpStatusEnum.js";

dotenv.config();

export function authenticate(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(HttpStatusEnum.UNAUTHORIZED).json({"message": MessagesEnum.ERROR_NO_TOKEN_PROVIDED});
    }

    try {
        const decoded = verifyToken(token);
        if (typeof decoded !== "string" && "id" in decoded) {
            res.locals.userId = decoded.id;
            next();
        } else {
            res.status(HttpStatusEnum.UNAUTHORIZED).json({"message": MessagesEnum.ERROR_INVALID_TOKEN});
        }
    } catch(err: any) {
        res.status(HttpStatusEnum.UNAUTHORIZED).json({"message": MessagesEnum.ERROR_INVALID_TOKEN});
    }
}