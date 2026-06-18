import { Router } from "express";
import { AuthController } from "../controllers/AuthController.js";
import { Route } from "../decorator/routeDecorator.js";
import { authenticate } from "../middleware/authenticate.js";
import { validate } from "../middleware/validate.js";
import { LoginSchema, RegisterSchema, RequestPasswordRecoverySchema, ResetPasswordSchema, UpdateProfileDetailsSchema, UpdateUserSchema } from "../schemas/AuthSchema.js";

@Route("/auth")
export class AuthRoutes {
    public router: Router = Router()
    private authController = new AuthController();

    constructor () {
        this.router.post('/login', validate(LoginSchema), (req, res) => this.authController.login(req, res));
        this.router.post('/register', validate(RegisterSchema), (req, res) => this.authController.register(req, res));
        this.router.post('/password/recovery', validate(RequestPasswordRecoverySchema), (req, res) => this.authController.requestPasswordRecovery(req, res));
        this.router.post('/password/reset', validate(ResetPasswordSchema), (req, res) => this.authController.resetPassword(req, res));
        this.router.get('/profile', authenticate, (req, res) => this.authController.profile(req, res));
        this.router.get('/profile/details', authenticate, (req, res) => this.authController.profileDetails(req, res));
        this.router.put('/profile/details', authenticate, validate(UpdateProfileDetailsSchema), (req, res) => this.authController.updateProfileDetails(req, res));
        this.router.put('/profile', authenticate, validate(UpdateUserSchema), (req, res) => this.authController.update(req, res));
        this.router.delete('/profile', authenticate, (req, res) => this.authController.delete(req, res));
    }
}