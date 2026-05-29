import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";
import { MessagesEnum } from "../shared/enums/messagesEnum.js";
import { HttpStatusEnum } from "../shared/enums/httpStatusEnum.js";

export const validate =
    (schema: AnyZodObject) =>
    (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse({
                params: req.params,
                body: req.body,
                query: req.query,
            });
            
            return next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(HttpStatusEnum.BAD_REQUEST).json({ message: MessagesEnum.BAD_REQUEST, issues: error.issues });
            }

            return res.status(HttpStatusEnum.INTERNAL_SERVER_ERROR).json({ message: MessagesEnum.ERROR_SERVER });
        }
    };