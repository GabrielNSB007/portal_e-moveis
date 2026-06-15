import { Router } from "express";
import type { Router as ExpressRouter } from "express";

import { MatchController } from "../controllers/MatchController.js";
import { Route } from "../decorator/routeDecorator.js";
import { authenticate } from "../middleware/authenticate.js";
import { validate } from "../middleware/validate.js";

import {
  CreateMatchSchema,
  EvaluateMatchSchema,
  GenerateMatchesSchema,
  ListMatchesSchema,
  MatchIdParamsSchema,
  UpdateMatchStatusSchema,
} from "../schemas/MatchSchema.js";

@Route("/matches")
export class MatchRoutes {
  public readonly router: ExpressRouter;
  private readonly matchController: MatchController;

  constructor() {
    this.router = Router();
    this.matchController = new MatchController();

    this.router.post(
      "/evaluate",
      authenticate,
      validate(EvaluateMatchSchema),
      (req, res) => this.matchController.evaluate(req, res),
    );

    this.router.post(
      "/",
      authenticate,
      validate(CreateMatchSchema),
      (req, res) => this.matchController.create(req, res),
    );

    this.router.post(
      "/generate",
      authenticate,
      validate(GenerateMatchesSchema),
      (req, res) => this.matchController.generate(req, res),
    );

    this.router.get(
      "/",
      authenticate,
      validate(ListMatchesSchema),
      (req, res) => this.matchController.list(req, res),
    );

    this.router.get(
      "/:id",
      authenticate,
      validate(MatchIdParamsSchema),
      (req, res) => this.matchController.getById(req, res),
    );

    this.router.patch(
      "/:id/status",
      authenticate,
      validate(UpdateMatchStatusSchema),
      (req, res) => this.matchController.updateStatus(req, res),
    );

    this.router.delete(
      "/:id",
      authenticate,
      validate(MatchIdParamsSchema),
      (req, res) => this.matchController.delete(req, res),
    );
  }
}
