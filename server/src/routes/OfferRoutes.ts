import { Router } from "express";
import { OfferController } from "../controllers/OfferController.js";
import { Route } from "../decorator/routeDecorator.js";

@Route("/offers")
export class OfferRoutes {
    public router: Router = Router()
    private offerController = new OfferController();

    constructor () {
        this.router.post('/create',(req, res) => this.offerController.create(req, res));
        this.router.get('/find/:id',(req, res) => this.offerController.readById(req, res));
        this.router.get('/find',(req, res) => this.offerController.readAll(req, res));
        this.router.put('/update/:id',(req, res) => this.offerController.update(req, res));
        this.router.delete('/delete/:id',(req, res) => this.offerController.delete(req, res));
    }
}