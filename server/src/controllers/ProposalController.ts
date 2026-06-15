import { Request, Response } from "express";

import {
  CreateProposalBody,
  UpdateProposalBody,
  UpdateProposalStatusBody,
} from "../schemas/ProposalSchema.js";
import { AppError } from "../errors/AppError.js";
import { ProposalService } from "../services/ProposalService.js";

export class ProposalController {
  constructor(private readonly proposalService = new ProposalService()) {}

  async create(req: Request<{}, {}, CreateProposalBody>, res: Response) {
    try {
      const buyerId = res.locals.userId;

      const proposal = await this.proposalService.create({
        ...req.body,
        buyerId,
      });

      return res.status(201).json(proposal);
    } catch (err: any) {
      return this.handleError(err, res);
    }
  }

  async listMine(_req: Request, res: Response) {
    try {
      const buyerId = res.locals.userId;

      const proposals = await this.proposalService.listMine(buyerId);

      return res.status(200).json(proposals);
    } catch (err: any) {
      return this.handleError(err, res);
    }
  }

  async listReceived(_req: Request, res: Response) {
    try {
      const sellerId = res.locals.userId;

      const proposals = await this.proposalService.listReceived(sellerId);

      return res.status(200).json(proposals);
    } catch (err: any) {
      return this.handleError(err, res);
    }
  }

  async listByOffer(req: Request, res: Response) {
    try {
      const requesterId = res.locals.userId;
      const { offerId } = req.params;

      const proposals = await this.proposalService.listByOffer(
        offerId,
        requesterId,
      );

      return res.status(200).json(proposals);
    } catch (err: any) {
      return this.handleError(err, res);
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const requesterId = res.locals.userId;
      const { id } = req.params;

      const proposal = await this.proposalService.findById(id, requesterId);

      return res.status(200).json(proposal);
    } catch (err: any) {
      return this.handleError(err, res);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const requesterId = res.locals.userId;
      const { id } = req.params;
      const body = req.body as UpdateProposalBody;

      const proposal = await this.proposalService.update(id, requesterId, body);

      return res.status(200).json(proposal);
    } catch (err: any) {
      return this.handleError(err, res);
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const requesterId = res.locals.userId;
      const { id } = req.params;
      const body = req.body as UpdateProposalStatusBody;

      const proposal = await this.proposalService.updateStatus(
        id,
        requesterId,
        body,
      );

      return res.status(200).json(proposal);
    } catch (err: any) {
      return this.handleError(err, res);
    }
  }

  async cancel(req: Request, res: Response) {
    try {
      const requesterId = res.locals.userId;
      const { id } = req.params;

      const proposal = await this.proposalService.cancel(id, requesterId);

      return res.status(200).json({
        message: "Proposta cancelada com sucesso",
        proposal,
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
