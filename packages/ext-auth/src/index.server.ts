/**
 *  Copyright 2022 OwlMeans
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

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

  router.post(SERVER_PROVIDE_AUTH, async (req, res) => {
    try {
      const { handler, extensions } = getAppContext(req)
      if (!handler.wallet) {
        throw ERROR_NO_WALLET
      }
      
      // console.log('Query', req.query)
      // console.log('Params', req.params)
      // console.log('Headers', req.headers)
      // console.log('Body', req.body)
      const presentation: Presentation = req.body
      // console.log(presentation)
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