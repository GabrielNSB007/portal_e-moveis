import type { CreateOffer, UpdateOffer, ReadDeleteOffer } from "@/types/offerTypes";
import api from "./api"

export const createOffer = async (offerData: CreateOffer) => {
    return api.post('/offers', offerData)
}

export const updateOffer = async (id : string, offerData: UpdateOffer) => {
    return api.patch(`/offers/${id}`, offerData)
}

export const findOfferById = async (id : string) => {
    return api.get<ReadDeleteOffer>(`/offers/${id}`)
}

export const findManyOffers = async () => {
    return api.get<ReadDeleteOffer[]>(`/offers/`)
}


export const deleteOffer = async (id : string) => {
    return api.delete(`/offers/${id}`)
}