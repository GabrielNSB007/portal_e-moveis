import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { optionalAuthenticate } from "../middleware/optionalAuthenticate.js";
import { OfferController } from "../controllers/OfferController.js";
import { Route } from "../decorator/routeDecorator.js";
import { authenticate } from "../middleware/authenticate.js";
import { validate } from "../middleware/validate.js";

import {
  CreateOfferSchema,
  ListOffersSchema,
  OfferIdParamsSchema,
  UpdateOfferSchema,
} from "../schemas/OfferSchema.js";

@Route("/offers")
export class OfferRoutes {
  public readonly router: ExpressRouter;
  private readonly offerController: OfferController;

  constructor() {
    this.router = Router();
    this.offerController = new OfferController();

    this.router.post(
      "/",
      authenticate,
      validate(CreateOfferSchema),
      (req, res) => this.offerController.create(req, res),
    );

    this.router.get("/", validate(ListOffersSchema), (req, res) =>
      this.offerController.readAll(req, res),
    );

    this.router.get(
      "/mine",
      authenticate,
      validate(ListOffersSchema),
      (req, res) => this.offerController.readMine(req, res),
    );

    this.router.get(
      "/:id",
      optionalAuthenticate,
      validate(OfferIdParamsSchema),
      (req, res) => this.offerController.readById(req, res),
    );

    this.router.patch(
      "/:id",
      authenticate,
      validate(UpdateOfferSchema),
      (req, res) => this.offerController.update(req, res),
    );

    this.router.delete(
      "/:id",
      authenticate,
      validate(OfferIdParamsSchema),
      (req, res) => this.offerController.delete(req, res),
    );
  }
}
