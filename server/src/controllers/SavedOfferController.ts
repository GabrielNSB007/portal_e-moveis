import { Request, Response } from "express";

import { prisma } from "../prisma.js";
import { AppError } from "../errors/AppError.js";

export class SavedOfferController {
  async list(req: Request, res: Response) {
    try {
      const userId = res.locals.userId;
      const saved = await prisma.savedOffer.findMany({
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
      });

      return res.status(200).json(saved);
    } catch (err: any) {
      return this.handleError(err, res);
    }
  }

  async create(req: Request, res: Response) {
    try {
      const userId = res.locals.userId;
      const { offerId } = req.body as { offerId?: string };

      if (!offerId) {
        throw new AppError("Informe o imovel para salvar", 400);
      }

      const offer = await prisma.offer.findUnique({ where: { id: offerId } });
      if (!offer) {
        throw new AppError("Oferta nao encontrada", 404);
      }

      const saved = await prisma.savedOffer.upsert({
        where: { userId_offerId: { userId, offerId } },
        create: { userId, offerId },
        update: {},
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
      });

      return res.status(201).json(saved);
    } catch (err: any) {
      return this.handleError(err, res);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const userId = res.locals.userId;
      const { offerId } = req.params;

      await prisma.savedOffer.deleteMany({ where: { userId, offerId } });

      return res.status(200).json({ message: "Imovel removido dos salvos" });
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
