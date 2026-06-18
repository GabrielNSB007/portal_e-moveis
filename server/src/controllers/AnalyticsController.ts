import { Request, Response } from "express";

import { prisma } from "../prisma.js";
import { AppError } from "../errors/AppError.js";

export class AnalyticsController {
  async registerView(req: Request, res: Response) {
    try {
      const userId = res.locals.userId as string | undefined;
      const { offerId } = req.params;

      const offer = await prisma.offer.findUnique({ where: { id: offerId }, select: { id: true } });
      if (!offer) throw new AppError("Oferta nao encontrada", 404);

      const view = await prisma.offerView.create({ data: { offerId, userId } });
      return res.status(201).json(view);
    } catch (err: any) {
      return this.handleError(err, res);
    }
  }

  async registerVisit(req: Request, res: Response) {
    try {
      const userId = res.locals.userId as string | undefined;
      const { offerId } = req.params;
      const { scheduledFor } = req.body as { scheduledFor?: string };

      const offer = await prisma.offer.findUnique({ where: { id: offerId }, select: { id: true } });
      if (!offer) throw new AppError("Oferta nao encontrada", 404);

      const visit = await prisma.offerVisit.create({
        data: {
          offerId,
          userId,
          scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
        },
      });

      return res.status(201).json(visit);
    } catch (err: any) {
      return this.handleError(err, res);
    }
  }

  async sellerSummary(req: Request, res: Response) {
    try {
      const userId = res.locals.userId;
      const offers = await prisma.offer.findMany({
        where: { userId },
        select: { id: true },
      });
      const offerIds = offers.map((offer) => offer.id);

      if (!offerIds.length) {
        return res.status(200).json({ totalViews: 0, totalVisits: 0, byOffer: {} });
      }

      const [views, visits] = await Promise.all([
        prisma.offerView.groupBy({
          by: ["offerId"],
          where: { offerId: { in: offerIds } },
          _count: { _all: true },
        }),
        prisma.offerVisit.groupBy({
          by: ["offerId"],
          where: { offerId: { in: offerIds } },
          _count: { _all: true },
        }),
      ]);

      const byOffer = offerIds.reduce<Record<string, { views: number; visits: number }>>((acc, offerId) => {
        acc[offerId] = { views: 0, visits: 0 };
        return acc;
      }, {});

      for (const item of views) byOffer[item.offerId].views = item._count._all;
      for (const item of visits) byOffer[item.offerId].visits = item._count._all;

      return res.status(200).json({
        totalViews: views.reduce((sum: number, item) => sum + item._count._all, 0),
        totalVisits: visits.reduce((sum: number, item) => sum + item._count._all, 0),
        byOffer,
      });
    } catch (err: any) {
      return this.handleError(err, res);
    }
  }

  private handleError(err: any, res: Response) {
    if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.message });
    return res.status(500).json({ error: err.message || "Erro interno no servidor" });
  }
}
