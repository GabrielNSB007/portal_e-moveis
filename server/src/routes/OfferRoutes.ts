import { Router } from "express";
import { OfferController } from "../controllers/OfferController.js";
import { Route } from "../decorator/routeDecorator.js";

@Route("/offers")
export class OfferRoutes {
    public router: Router = Router()
    private offerController = new OfferController();

    constructor () {
        this.router.post('/',(req, res) => this.offerController.create(req, res));
        this.router.get('/:id',(req, res) => this.offerController.readById(req, res));
        this.router.get('/',(req, res) => this.offerController.readAll(req, res));
        this.router.put('/:id',(req, res) => this.offerController.update(req, res));
        this.router.delete('/:id',(req, res) => this.offerController.delete(req, res));
    }
}