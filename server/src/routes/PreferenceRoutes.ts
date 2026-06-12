import { Router } from "express";
import type { Router as ExpressRouter } from "express";

import { PreferenceController } from "../controllers/PreferenceController.js";
import { Route } from "../decorator/routeDecorator.js";
import { authenticate } from "../middleware/authenticate.js";
import { validate } from "../middleware/validate.js";

import {
  CreatePreferenceSchema,
  ListPreferencesSchema,
  PreferenceIdParamsSchema,
  UpdatePreferenceSchema,
} from "../schemas/PreferenceSchema.js";

@Route("/preferences")
export class PreferenceRoutes {
  public readonly router: ExpressRouter;
  private readonly preferenceController: PreferenceController;

  constructor() {
    this.router = Router();
    this.preferenceController = new PreferenceController();

    this.router.post(
      "/",
      authenticate,
      validate(CreatePreferenceSchema),
      (req, res) => this.preferenceController.create(req, res),
    );

    this.router.get(
      "/",
      authenticate,
      validate(ListPreferencesSchema),
      (req, res) => this.preferenceController.list(req, res),
    );

    this.router.get(
      "/:id",
      authenticate,
      validate(PreferenceIdParamsSchema),
      (req, res) => this.preferenceController.getById(req, res),
    );

    this.router.patch(
      "/:id",
      authenticate,
      validate(UpdatePreferenceSchema),
      (req, res) => this.preferenceController.update(req, res),
    );

    this.router.patch(
      "/:id/activate",
      authenticate,
      validate(PreferenceIdParamsSchema),
      (req, res) => this.preferenceController.activate(req, res),
    );

    this.router.delete(
      "/:id",
      authenticate,
      validate(PreferenceIdParamsSchema),
      (req, res) => this.preferenceController.deactivate(req, res),
    );
  }
}
