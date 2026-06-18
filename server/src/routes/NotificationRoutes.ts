import { Router } from "express";
import type { Router as ExpressRouter } from "express";

import { NotificationController } from "../controllers/NotificationController.js";
import { Route } from "../decorator/routeDecorator.js";
import { authenticate } from "../middleware/authenticate.js";

@Route("/notifications")
export class NotificationRoutes {
  public readonly router: ExpressRouter;
  private readonly controller: NotificationController;

  constructor() {
    this.router = Router();
    this.controller = new NotificationController();

    this.router.get("/", authenticate, (req, res) => this.controller.list(req, res));
    this.router.patch("/read-all", authenticate, (req, res) => this.controller.markAllRead(req, res));
    this.router.patch("/:id/read", authenticate, (req, res) => this.controller.markRead(req, res));
  }
}
