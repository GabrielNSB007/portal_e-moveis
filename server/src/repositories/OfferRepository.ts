import {type Offer, PrismaClient } from "@prisma/client";

export default class OfferRepository{
    private prisma  = new PrismaClient()

    async create(data: Offer) : Promise<Offer | null>{
        return await this.prisma.offer.create({ data })
    }

    async getById(id: string) : Promise<Offer | null>{
        return await this.prisma.offer.findUnique({
            where: {id}
        })
    }

    async getMany() : Promise<Offer[] | null>{
        return await this.prisma.offer.findMany({
            include: {user: true},
            orderBy: {createdAt: "desc"}
        })
    }

    async update(id : string, data : Partial<Offer>){
        return await this.prisma.offer.update({
            where: {id},
            data,
        })
    }

    async delete(id: string) {
        return await this.prisma.offer.delete({
            where : {id}
        })
    }
}