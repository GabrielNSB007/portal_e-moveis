import { Request, Response } from 'express'

import { CreateMatchService } from '../services/CreateMatchService'

export class MatchController {
    async create(req: Request, res: Response) {
        try {

            const { offerId, preferenceId, score } = req.body

            const service = new CreateMatchService()

            const match = await service.execute({
                offerId,
                preferenceId,
                score
            })

            return res.status(201).json(match)

        } catch (error) {

            return res.status(400).json({
                message:
                    error instanceof Error
                        ? error.message
                        : 'Unexpected error'
            })

        }
    }
}