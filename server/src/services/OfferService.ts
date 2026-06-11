import { type Offer } from "@prisma/client";
import OfferRepository from "../repositories/OfferRepository";
import { MessagesEnum } from "../shared/enums/messagesEnum";

export class OfferService {
    private offerRepository = new OfferRepository()

    async createOffer(data: Offer) : Promise<Offer | null>{
        const offerId = await this.offerRepository.getById(data.id)
        if(offerId){
            throw new Error(MessagesEnum.ERROR_EMAIL_ALREADY_REGISTERED)
        }
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

    async updateOffer(id:string, data: Partial<Offer>) {
            const offerId = await this.offerRepository.getById(id);
            if (!offerId) throw new Error(MessagesEnum.ERROR_USER_NOT_FOUND);
    
            const updatedOffer = await this.offerRepository.update(id, data);
            return updatedOffer;
        }

    
}