import { Router } from 'express'
import {
  buildServerExtension, ERROR_NO_WALLET, getAppContext
} from '@owlmeans/regov-lib-node'
import { authExtension } from './ext'
import { REGOV_AUTH_REQUEST_TYPE, SERVER_REQUEST_AUTH } from './types'

export * from './types'
export * from './ext'


export const authServerExtension = buildServerExtension(authExtension, () => {
  const router = Router()

  router.get(SERVER_REQUEST_AUTH + ':did', async (req, res) => {
    try {
      const handler = getAppContext(req).handler
      if (!handler.wallet) {
        throw ERROR_NO_WALLET
      }
      const factory = authExtension.getFactory(REGOV_AUTH_REQUEST_TYPE)
      const unsigned = await factory.build(handler.wallet, {
        subjectData: {
          did: req.params.did,
          createdAt: (new Date).toISOString()
        }
      })
      const request = await factory.request(handler.wallet, { unsignedRequest: unsigned })
      res.json(request)
    } catch (e) {
      res.status(500).send(`${e}`)
    }
  })

  return router
})