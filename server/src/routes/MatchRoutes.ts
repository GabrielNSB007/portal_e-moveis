import { Router } from 'express'

import { MatchController } from '../controllers/MatchController.js'

const matchRoutes : Router = Router()

const matchController = new MatchController()

matchRoutes.post(
  '/',
  matchController.create
)

export { matchRoutes }