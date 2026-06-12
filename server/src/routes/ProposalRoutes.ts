import { Router, Request, Response } from "express";
import { Route } from "../decorator/routeDecorator.js";
import { authenticate } from "../middleware/authenticate.js";
import { validate } from "../middleware/validate.js";
import { ProposalController } from "../controllers/ProposalController.js";
import {
  CreateProposalSchema,
  OfferIdParamSchema,
  ProposalIdParamSchema,
  UpdateProposalSchema,
  CreateProposalBody,
  UpdateProposalBody,
  OfferIdParams,
  ProposalIdParams,
} from "../schemas/ProposalSchema.js";

@Route("/proposals")
export class ProposalRoutes {
  public router = Router();

  private readonly proposalController = new ProposalController();

  constructor() {
    this.router.post(
      "/",
      authenticate,
      validate(CreateProposalSchema),
      (req: Request<{}, {}, CreateProposalBody>, res: Response) =>
        this.proposalController.create(req, res),
    );

    this.router.get("/", authenticate, (req: Request, res: Response) =>
      this.proposalController.listMine(req, res),
    );

    this.router.get(
      "/offer/:offerId",
      authenticate,
      validate(OfferIdParamSchema),
      (req: Request<OfferIdParams>, res: Response) =>
        this.proposalController.listByOffer(req, res),
    );

    this.router.get(
      "/:id",
      authenticate,
      validate(ProposalIdParamSchema),
      (req: Request<ProposalIdParams>, res: Response) =>
        this.proposalController.findById(req, res),
    );

    this.router.put(
      "/:id",
      authenticate,
      validate(UpdateProposalSchema),
      (req: Request<ProposalIdParams, {}, UpdateProposalBody>, res: Response) =>
        this.proposalController.update(req, res),
    );

    this.router.delete(
      "/:id",
      authenticate,
      validate(ProposalIdParamSchema),
      (req: Request<ProposalIdParams>, res: Response) =>
        this.proposalController.delete(req, res),
    );
  }
}