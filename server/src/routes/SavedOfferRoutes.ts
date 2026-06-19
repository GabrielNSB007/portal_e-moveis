import { Router } from "express";
import type { Router as ExpressRouter } from "express";

import { SavedOfferController } from "../controllers/SavedOfferController.js";
import { Route } from "../decorator/routeDecorator.js";
import { authenticate } from "../middleware/authenticate.js";

@Route("/saved-offers")
export class SavedOfferRoutes {
  public readonly router: ExpressRouter;
  private readonly controller: SavedOfferController;

  constructor() {
    this.router = Router();
    this.controller = new SavedOfferController();

    this.router.get("/", authenticate, (req, res) => this.controller.list(req, res));
    this.router.post("/", authenticate, (req, res) => this.controller.create(req, res));
    this.router.delete("/:offerId", authenticate, (req, res) => this.controller.delete(req, res));
  }
}
