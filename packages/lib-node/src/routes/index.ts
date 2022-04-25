
import { Router } from 'express'
import { getAppContext } from '../app'


export const buildRotuer = () => {
  const router = Router()

  router.get('/auth/start', async (req) => {
    const app = getAppContext(req)
  })

  return router
}