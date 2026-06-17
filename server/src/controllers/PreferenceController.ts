import { Request, Response } from "express";

import { PreferenceService } from "../services/PreferenceService.js";
import { HttpStatusEnum } from "../shared/enums/httpStatusEnum.js";
import { AppError } from "../errors/AppError.js";

export class PreferenceController {
  constructor(
    private preferenceService: PreferenceService = new PreferenceService(),
  ) {}

  async create(req: Request, res: Response) {
    try {
      const userId = res.locals.userId;

      const preference = await this.preferenceService.create({
        userId,
        ...req.body,
      });

      return res.status(HttpStatusEnum.CREATED).json(preference);
    } catch (err: any) {
      return this.handleError(err, res);
    }
  }

  async list(req: Request, res: Response) {
    try {
      const userId = res.locals.userId;

      const result = await this.preferenceService.list({
        userId,
        isActive: req.query.isActive as boolean | undefined,
        city: req.query.city as string | undefined,
        state: req.query.state as string | undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20,
      });

      return res.status(HttpStatusEnum.OK).json(result);
    } catch (err: any) {
      return this.handleError(err, res);
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const userId = res.locals.userId;
      const { id } = req.params;

      const preference = await this.preferenceService.getById(userId, id);

      return res.status(HttpStatusEnum.OK).json(preference);
    } catch (err: any) {
      return this.handleError(err, res);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const userId = res.locals.userId;
      const { id } = req.params;

      const preference = await this.preferenceService.update(
        userId,
        id,
        req.body,
      );

      return res.status(HttpStatusEnum.OK).json(preference);
    } catch (err: any) {
      return this.handleError(err, res);
    }
  }

  async deactivate(req: Request, res: Response) {
    try {
      const userId = res.locals.userId;
      const { id } = req.params;

      const preference = await this.preferenceService.deactivate(userId, id);

      return res.status(HttpStatusEnum.OK).json({
        message: "Preferência desativada com sucesso",
        preference,
      });
    } catch (err: any) {
      return this.handleError(err, res);
    }
  }

  async activate(req: Request, res: Response) {
    try {
      const userId = res.locals.userId;
      const { id } = req.params;

      const preference = await this.preferenceService.activate(userId, id);

      return res.status(HttpStatusEnum.OK).json({
        message: "Preferência ativada com sucesso",
        preference,
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

    return res.status(HttpStatusEnum.INTERNAL_SERVER_ERROR).json({
      error: err.message || "Erro interno no servidor",
    });
  }
}
