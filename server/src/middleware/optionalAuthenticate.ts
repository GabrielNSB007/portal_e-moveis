import { NextFunction, Request, Response } from "express";

import { verifyToken } from "../utils/jwtUtils.js";

export function optionalAuthenticate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = verifyToken(token);

    if (typeof decoded !== "string" && "id" in decoded) {
      res.locals.userId = decoded.id;
    }

    return next();
  } catch {
    return next();
  }
}
