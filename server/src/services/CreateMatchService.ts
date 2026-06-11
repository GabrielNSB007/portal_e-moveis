import { MatchRepository } from '../repositories/MatchRepository.js';

interface IRequest {
    offerId: string
    preferenceId: string
    score: number
}

export class CreateMatchService {
    async execute({ offerId, preferenceId, score }: IRequest) {

        const repository = new MatchRepository()
        const matchAlreadyExists = 
            await repository.findExistingMatch(offerId, preferenceId)

        if (matchAlreadyExists) {
            throw new Error('Match already exists')
        }

        const match = await repository.create({ offerId, preferenceId, score })
        
        return match
    }
}