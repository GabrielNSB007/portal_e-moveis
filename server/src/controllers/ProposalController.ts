import { Request, Response } from "express";
import {
  CreateProposalBody,
  OfferIdParams,
  ProposalIdParams,
  UpdateProposalBody,
} from "../schemas/ProposalSchema.js";
import {
  ProposalService,
  ProposalServiceError,
} from "../services/ProposalService.js";

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
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  async listMine(_req: Request, res: Response) {
    try {
      const buyerId = res.locals.userId;

      const proposals = await this.proposalService.listMine(buyerId);

      return res.status(200).json(proposals);
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  async listByOffer(req: Request<OfferIdParams>, res: Response) {
    try {
      const requesterId = res.locals.userId;
      const { offerId } = req.params;

      const proposals = await this.proposalService.listByOffer(
        offerId,
        requesterId,
      );

      return res.status(200).json(proposals);
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  async findById(req: Request<ProposalIdParams>, res: Response) {
    try {
      const requesterId = res.locals.userId;
      const { id } = req.params;

      const proposal = await this.proposalService.findById(id, requesterId);

      return res.status(200).json(proposal);
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  async update(
    req: Request<ProposalIdParams, {}, UpdateProposalBody>,
    res: Response,
  ) {
    try {
      const requesterId = res.locals.userId;
      const { id } = req.params;

      const proposal = await this.proposalService.update(
        id,
        requesterId,
        req.body,
      );

      return res.status(200).json(proposal);
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  async delete(req: Request<ProposalIdParams>, res: Response) {
    try {
      const requesterId = res.locals.userId;
      const { id } = req.params;

      const proposal = await this.proposalService.delete(id, requesterId);

      return res.status(200).json({
        message: "Proposta deletada com sucesso",
        proposal,
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  private handleError(error: unknown, res: Response) {
    const message =
      error instanceof Error ? error.message : "Erro interno no servidor";

    switch (message) {
      case ProposalServiceError.OFFER_NOT_FOUND:
      case ProposalServiceError.PROPOSAL_NOT_FOUND:
        return res.status(404).json({ message });

      case ProposalServiceError.FORBIDDEN:
        return res.status(403).json({ message });

      case ProposalServiceError.PROPOSAL_ALREADY_EXISTS:
        return res.status(409).json({ message });

      case ProposalServiceError.OWN_OFFER:
      case ProposalServiceError.OFFER_NOT_ACTIVE:
      case ProposalServiceError.NO_UPDATE_FIELDS:
        return res.status(422).json({ message });

      default:
        return res.status(500).json({
          message: "Erro interno no servidor",
        });
    }
  }
}