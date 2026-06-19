import { Router } from "express";
import type { Router as ExpressRouter } from "express";

import { AnalyticsController } from "../controllers/AnalyticsController.js";
import { Route } from "../decorator/routeDecorator.js";
import { authenticate } from "../middleware/authenticate.js";

@Route("/analytics")
export class AnalyticsRoutes {
  public readonly router: ExpressRouter;
  private readonly controller: AnalyticsController;

  constructor() {
    this.router = Router();
    this.controller = new AnalyticsController();

    this.router.get("/seller/summary", authenticate, (req, res) => this.controller.sellerSummary(req, res));
    this.router.post("/offers/:offerId/view", authenticate, (req, res) => this.controller.registerView(req, res));
    this.router.post("/offers/:offerId/visit", authenticate, (req, res) => this.controller.registerVisit(req, res));
  }
}
