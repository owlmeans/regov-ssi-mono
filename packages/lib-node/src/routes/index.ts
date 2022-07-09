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

import { Presentation, singleValue, Credential, VALIDATION_KIND_OFFER, ERROR_NO_EXTENSION, REGISTRY_TYPE_IDENTITIES, REGISTRY_SECTION_PEER } from '@owlmeans/regov-ssi-core'
import { Router } from 'express'
import { ERROR_NO_WALLET, getAppContext } from '../app'
import { ERROR_NO_CREDENTIAL, SERVER_ALL_TRUSTED_VCS, SERVER_VALIDATE_OFFER } from '../types'


export const buildRotuer = () => {
  const router = Router()

  router.get(SERVER_ALL_TRUSTED_VCS, async (req, res) => {
    try {
      const { handler } = getAppContext(req)

      const response = handler.wallet?.getRegistry(REGISTRY_TYPE_IDENTITIES)
        .registry.credentials[REGISTRY_SECTION_PEER].map(
          wrapper => wrapper.credential
        ) || []

        res.json(response)
    } catch (e) {
      res.status(500).send(`${e}`)
    }
  })

  router.post(SERVER_VALIDATE_OFFER, async (req, res) => {
    try {
      const { handler, extensions } = getAppContext(req)
      if (!handler.wallet) {
        throw ERROR_NO_WALLET
      }

      const presentation: Presentation = req.body
      const credential = singleValue(presentation.verifiableCredential)
      if (!credential) {
        throw ERROR_NO_CREDENTIAL
      }

      const extension = extensions.registry.getExtension(req.params.type)
      if (!extension) {
        throw ERROR_NO_EXTENSION
      }
      const factory = extension.getFactory(req.params.type)

      const result = await factory.validate(handler.wallet, {
        presentation, credential,
        extensions: extensions.registry,
        kind: VALIDATION_KIND_OFFER
      })

      res.json(result)
    } catch (e) {
      res.status(500).send(`${e}`)
    }
  })

  return router
}