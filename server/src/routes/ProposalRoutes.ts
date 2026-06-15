import { Router } from "express";
import type { Router as ExpressRouter } from "express";

import { ProposalController } from "../controllers/ProposalController.js";
import { Route } from "../decorator/routeDecorator.js";
import { authenticate } from "../middleware/authenticate.js";
import { validate } from "../middleware/validate.js";

import {
  CreateProposalSchema,
  OfferIdParamSchema,
  ProposalIdParamSchema,
  UpdateProposalSchema,
  UpdateProposalStatusSchema,
} from "../schemas/ProposalSchema.js";

@Route("/proposals")
export class ProposalRoutes {
  public readonly router: ExpressRouter;
  private readonly proposalController: ProposalController;

  constructor() {
    this.router = Router();
    this.proposalController = new ProposalController();

    this.router.post(
      "/",
      authenticate,
      validate(CreateProposalSchema),
      (req, res) => this.proposalController.create(req, res),
    );

    this.router.get("/", authenticate, (req, res) =>
      this.proposalController.listMine(req, res),
    );

    this.router.get("/received", authenticate, (req, res) =>
      this.proposalController.listReceived(req, res),
    );

    this.router.get(
      "/offer/:offerId",
      authenticate,
      validate(OfferIdParamSchema),
      (req, res) => this.proposalController.listByOffer(req, res),
    );

    this.router.get(
      "/:id",
      authenticate,
      validate(ProposalIdParamSchema),
      (req, res) => this.proposalController.findById(req, res),
    );

    this.router.patch(
      "/:id",
      authenticate,
      validate(UpdateProposalSchema),
      (req, res) => this.proposalController.update(req, res),
    );

    this.router.patch(
      "/:id/status",
      authenticate,
      validate(UpdateProposalStatusSchema),
      (req, res) => this.proposalController.updateStatus(req, res),
    );

    this.router.delete(
      "/:id",
      authenticate,
      validate(ProposalIdParamSchema),
      (req, res) => this.proposalController.cancel(req, res),
    );
  }
}
