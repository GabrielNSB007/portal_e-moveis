import { Request, Response } from "express";

import {
  CreateOfferBody,
  ListOffersQuery,
  UpdateOfferBody,
} from "../schemas/OfferSchema.js";
import { AppError } from "../errors/AppError.js";
import { OfferService } from "../services/OfferService.js";

export class OfferController {
  constructor(
    private readonly offerService: OfferService = new OfferService(),
  ) {}

  async create(req: Request, res: Response) {
    try {
      const userId = res.locals.userId;
      const body = req.body as CreateOfferBody;

      const offer = await this.offerService.createOffer({
        ...body,
        userId,
      });

      return res.status(201).json(offer);
    } catch (err: any) {
      return this.handleError(err, res);
    }
  }


  async readMine(req: Request, res: Response) {
    try {
      const userId = res.locals.userId;
      const query = req.query as unknown as ListOffersQuery;

      const result = await this.offerService.findMine(userId, {
        city: query.city,
        state: query.state,
        status: query.status,
        propertyType: query.propertyType,
        minPrice: query.minPrice,
        maxPrice: query.maxPrice,
        page: query.page ?? 1,
        limit: query.limit ?? 50,
      });

      return res.status(200).json(result);
    } catch (err: any) {
      return this.handleError(err, res);
    }
  }

  async readById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const offer = await this.offerService.findById(id);

      return res.status(200).json(offer);
    } catch (err: any) {
      return this.handleError(err, res);
    }
  }

  async readAll(req: Request, res: Response) {
    try {
      const query = req.query as unknown as ListOffersQuery;

      const result = await this.offerService.findAll({
        city: query.city,
        state: query.state,
        status: query.status,
        propertyType: query.propertyType,
        minPrice: query.minPrice,
        maxPrice: query.maxPrice,
        page: query.page ?? 1,
        limit: query.limit ?? 20,
      });

      return res.status(200).json(result);
    } catch (err: any) {
      return this.handleError(err, res);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const userId = res.locals.userId;
      const { id } = req.params;
      const body = req.body as UpdateOfferBody;

      const offer = await this.offerService.updateOffer(userId, id, body);

      return res.status(200).json(offer);
    } catch (err: any) {
      return this.handleError(err, res);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const userId = res.locals.userId;
      const { id } = req.params;

      const offer = await this.offerService.deleteOffer(userId, id);

      return res.status(200).json({
        message: "Oferta removida com sucesso",
        offer,
      });
    } catch (err: any) {
      return this.handleError(err, res);
    }
  }

  private handleError(err: any, res: Response) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({
        error: err.message,
      });
    }

    return res.status(500).json({
      error: err.message || "Erro interno no servidor",
    });
  }
}
