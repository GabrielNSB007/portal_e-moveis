import { Request, Response } from "express";

import { prisma } from "../prisma.js";
import { AppError } from "../errors/AppError.js";

export class NotificationController {
  async list(req: Request, res: Response) {
    try {
      const userId = res.locals.userId;
      const notifications = await prisma.notification.findMany({
        where: { userId },
        include: {
          offer: {
            include: {
              media: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                  role: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 80,
      });

      return res.status(200).json(notifications);
    } catch (err: any) {
      return this.handleError(err, res);
    }
  }

  async markRead(req: Request, res: Response) {
    try {
      const userId = res.locals.userId;
      const { id } = req.params;

      const result = await prisma.notification.updateMany({
        where: { id, userId },
        data: { read: true },
      });

      if (!result.count) {
        throw new AppError("Notificacao nao encontrada", 404);
      }

      const notification = await prisma.notification.findUnique({ where: { id } });
      return res.status(200).json(notification);
    } catch (err: any) {
      return this.handleError(err, res);
    }
  }

  async markAllRead(req: Request, res: Response) {
    try {
      const userId = res.locals.userId;
      await prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
      return res.status(200).json({ message: "Notificacoes marcadas como lidas" });
    } catch (err: any) {
      return this.handleError(err, res);
    }
  }

  private handleError(err: any, res: Response) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.message });
    }

    return res.status(500).json({ error: err.message || "Erro interno no servidor" });
  }
}
