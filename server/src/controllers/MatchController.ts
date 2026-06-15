import { Request, Response } from "express";
import { MatchStatus } from "@prisma/client";

import { MatchmakingService } from "../services/MatchMakingService.js";
import { AppError } from "../errors/AppError.js";
import { HttpStatusEnum } from "../shared/enums/httpStatusEnum.js";

type ListMatchQuery = {
  status?: MatchStatus;
  minScore?: number;
  page?: number;
  limit?: number;
};

export class MatchController {
  constructor(
    private readonly matchService: MatchmakingService = new MatchmakingService(),
  ) {}

  async evaluate(req: Request, res: Response) {
    try {
      const userId = res.locals.userId;
      const { offerId, preferenceId } = req.body;

      const evaluation = await this.matchService.evaluatePair(
        userId,
        offerId,
        preferenceId,
      );

      return res.status(HttpStatusEnum.OK).json(evaluation);
    } catch (err: any) {
      return this.handleError(err, res);
    }
  }

  async create(req: Request, res: Response) {
    try {
      const userId = res.locals.userId;
      const { offerId, preferenceId, minScore } = req.body;

      const result = await this.matchService.createFromPair({
        userId,
        offerId,
        preferenceId,
        minScore,
      });

      return res
        .status(
          result.createdOrUpdated ? HttpStatusEnum.CREATED : HttpStatusEnum.OK,
        )
        .json(result);
    } catch (err: any) {
      return this.handleError(err, res);
    }
  }

  async generate(req: Request, res: Response) {
    try {
      const userId = res.locals.userId;
      const { offerId, preferenceId, minScore } = req.body;

      const result = await this.matchService.generateMatches({
        userId,
        offerId,
        preferenceId,
        minScore,
      });

      return res.status(HttpStatusEnum.CREATED).json(result);
    } catch (err: any) {
      return this.handleError(err, res);
    }
  }

  async list(req: Request, res: Response) {
    try {
      const userId = res.locals.userId;
      const query = req.query as unknown as ListMatchQuery;

      const result = await this.matchService.listMatches({
        userId,
        status: query.status,
        minScore: query.minScore,
        page: query.page ?? 1,
        limit: query.limit ?? 20,
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

      const match = await this.matchService.getMatchById(userId, id);

      return res.status(HttpStatusEnum.OK).json(match);
    } catch (err: any) {
      return this.handleError(err, res);
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const userId = res.locals.userId;
      const { id } = req.params;
      const { status } = req.body;

      const match = await this.matchService.updateStatus(userId, id, status);

      return res.status(HttpStatusEnum.OK).json(match);
    } catch (err: any) {
      return this.handleError(err, res);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const userId = res.locals.userId;
      const { id } = req.params;

      const result = await this.matchService.deleteMatch(userId, id);

      return res.status(HttpStatusEnum.OK).json(result);
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
