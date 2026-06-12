import { type Offer } from "@prisma/client";
import { type Request, type Response } from "express";
import OfferRepository from "../repositories/OfferRepository";
import { MessagesEnum } from "../shared/enums/messagesEnum";
import { HttpStatusEnum } from "../shared/enums/httpStatusEnum.js";
import { OfferService } from "../services/OfferService";

interface UpdateOfferParams {
    id : string //trocar TODOS os interfaces de lugar para uma pasta de DTOs ou types
}

interface DeleteOfferParams extends UpdateOfferParams{}
interface ReadOfferParams extends UpdateOfferParams{}



export class OfferController{
    constructor(private offerService : OfferService = new OfferService()){}

    async create (req : Request<{}, {}, Offer>, res: Response){
        try {
            const data = req.body
            const offerData = await this.offerService.createOffer(data)
            res.status(HttpStatusEnum.OK).json({offerData}); 
        } catch (err: any) {
            res.status(HttpStatusEnum.INVALID_CREDENTIALS).send({ error: err.message });
        }
    }

    async readById (req : Request<ReadOfferParams>, res : Response){
        
        try {
            const id = req.params.id
   
            const data = await this.offerService.findById(id)
            res.status(HttpStatusEnum.OK).json({data})
        } catch (err : any) {
            res.status(HttpStatusEnum.INTERNAL_SERVER_ERROR).send({error: err.message})
        }
    }

    async readAll (req : Request, res : Response){
        
        try {

            const data = await this.offerService.findAll()
            res.status(HttpStatusEnum.OK).json({data})
        } catch (err : any) {
            res.status(HttpStatusEnum.INTERNAL_SERVER_ERROR).send({error: err.message})
        }
    }

    async update (req : Request<UpdateOfferParams, Partial<Offer>>, res : Response){
        
        try {
            
            const id = req.params.id
            const data = req.body

            const updatedData = await this.offerService.updateOffer(id, data)
            res.status(HttpStatusEnum.OK).json(updatedData)
        } catch (err : any) {
            res.status(HttpStatusEnum.BAD_REQUEST).send({error: err.message})
        }
    }

    async delete (req : Request<DeleteOfferParams>, res: Response){

        try {
            
            const id = req.params.id
            const deletedData = await this.offerService.deleteOffer(id)
            res.status(HttpStatusEnum.OK).json(deletedData)
        } catch (err : any) {
            res.status(HttpStatusEnum.BAD_REQUEST).send({error: err.message})
        }
    }

}