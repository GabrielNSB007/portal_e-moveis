import { prisma } from '../prisma'

interface CreateMatchDTO {
    offerId: string
    preferenceId: string
    score: number
}

export class MatchRepository {

    async create({ offerId, preferenceId, score }: CreateMatchDTO) {
        return prisma.match.create({
            data: {
                offerId,
                preferenceId,
                score
            }
        })
    }

    async findExistingMatch(offerId: string, preferenceId: string) {
        return prisma.match.findUnique({
            where: {
                offerId_preferenceId: {
                    offerId,
                    preferenceId
                }
            }
        })
    }


}