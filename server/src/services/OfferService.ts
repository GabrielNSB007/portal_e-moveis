import { type Offer } from "@prisma/client";
import {CreateOfferDTO,UpdateOfferDTO} from "../DTOs/offerDTO";
import OfferRepository from "../repositories/OfferRepository";
import { MessagesEnum } from "../shared/enums/messagesEnum";

export class OfferService {
    private offerRepository = new OfferRepository()

    async createOffer(data: CreateOfferDTO) : Promise<Offer | null>{
        const offer = await this.offerRepository.create(data)
        return offer
    }

    async findAll() : Promise<Offer[] | null>{
        const allOffers = await this.offerRepository.getMany()
        return allOffers
    }

    async findById(id: string) : Promise<Offer | null>{
        const offer = await this.offerRepository.getById(id)
        if(!offer){
            throw new Error(MessagesEnum.ERROR_USER_NOT_FOUND)
        }

        return offer
    }

    async updateOffer(id: string, data: UpdateOfferDTO) {
        const offerId = await this.offerRepository.getById(id);
        if (!offerId) throw new Error(MessagesEnum.ERROR_USER_NOT_FOUND);

        const updatedOffer = await this.offerRepository.update(id, data);
        return updatedOffer;
    }

    async deleteOffer(id:string){
        const offerId = await this.offerRepository.getById(id)
        if (!offerId) throw new Error(MessagesEnum.ERROR_USER_NOT_FOUND)
        
        const deletedOffer = await this.offerRepository.delete(id)
        return deletedOffer 
    }

    
    
}