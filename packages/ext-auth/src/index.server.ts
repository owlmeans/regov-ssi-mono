import { Router } from 'express'
import {
  buildServerExtension, ERROR_NO_WALLET, getAppContext
} from '@owlmeans/regov-lib-node'
import { authExtension } from './ext'
import {
  ERROR_NO_AUTHENTICATION_FROM_EXTERNAL_WALLET, REGOV_CREDENTIAL_TYPE_AUTH, SERVER_PROVIDE_AUTH
} from './types'
import { Presentation } from '@owlmeans/regov-ssi-core'
import { getAuthFromPresentation } from './util'

export * from './types'
export * from './ext'


export const authServerExtension = buildServerExtension(authExtension, () => {
  const router = Router()

  // router.get(SERVER_REQUEST_AUTH + ':did', async (req, res) => {
  //   try {
  //     const { handler } = getAppContext(req)
  //     if (!handler.wallet) {
  //       throw ERROR_NO_WALLET
  //     }
  //     const factory = authExtension.getFactory(REGOV_AUTH_REQUEST_TYPE)
  //     const unsigned = await factory.build(handler.wallet, {
  //       subjectData: {
  //         did: req.params.did,
  //         createdAt: (new Date).toISOString()
  //       }
  //     })
  //     const request = await factory.request(handler.wallet, {
  //       unsignedRequest: unsigned,
  //       identity: handler.wallet.getIdentity()?.credential
  //     })
  //     res.json(request)
  //   } catch (e) {
  //     res.status(500).send(`${e}`)
  //   }
  // })

  router.post(SERVER_PROVIDE_AUTH, async (req, res) => {
    try {
      const { handler, extensions } = getAppContext(req)
      if (!handler.wallet) {
        throw ERROR_NO_WALLET
      }
      
      const presentation: Presentation = req.body
      const credential = getAuthFromPresentation(presentation)
      if (!credential) {
        throw ERROR_NO_AUTHENTICATION_FROM_EXTERNAL_WALLET
      }

      const factory = authExtension.getFactory(REGOV_CREDENTIAL_TYPE_AUTH)
      const result = await factory.validate(handler.wallet, {
        presentation, credential, extensions: extensions.registry
      })
      res.json(result)
    } catch (e) {
      res.status(500).send(`${e}`)
    }
  })

  return router
})