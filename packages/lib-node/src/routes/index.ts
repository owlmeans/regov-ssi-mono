/**
 *  Copyright 2023 OwlMeans
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

import {
  Presentation, singleValue, ERROR_NO_EXTENSION, REGISTRY_TYPE_IDENTITIES,
  REGISTRY_SECTION_PEER, RegistryType, REGISTRY_TYPE_CREDENTIALS, defaultRequestMethod,
  UnsignedCredential, MaybeArray, defaultBuildMethod, normalizeValue, ValidationResult
} from '@owlmeans/regov-ssi-core'
import { Router } from 'express'
import { ERROR_NO_WALLET, getAppContext } from '../app'
import {
  ERROR_NO_CREDENTIAL, SERVER_ALL_TRUSTED_TYPES, SERVER_ALL_TRUSTED_VCS,
  SERVER_ALL_TYPE_CREDENTIALS, SERVER_CREATE_REQUEST, SERVER_VALIDATE_OFFER, SERVER_VALIDATE_REQUEST
} from '../types'
import { randomRequestSchema, randomRequestUrl } from './schemas'


export const buildRotuer = () => {
  const router = Router()

  router.get(SERVER_ALL_TRUSTED_TYPES, async (req, res) => {
    try {
      const { handler } = getAppContext(req)

      let type: RegistryType = REGISTRY_TYPE_IDENTITIES
      let section: string = REGISTRY_SECTION_PEER
      switch (req.params.type) {
        case SERVER_ALL_TYPE_CREDENTIALS:
          type = REGISTRY_TYPE_CREDENTIALS
      }

      const response = handler.wallet?.getRegistry(type)
        .registry.credentials[section].map(
          wrapper => wrapper.credential
        ) || []

      res.json(response)
    } catch (e) {
      res.status(500).send(`${e}`)
    }
  })

  router.get(SERVER_ALL_TRUSTED_VCS, async (req, res) => {
    try {
      const { handler } = getAppContext(req)

      const response = handler.wallet?.getRegistry(REGISTRY_TYPE_IDENTITIES)
        .registry.credentials[REGISTRY_SECTION_PEER]
        .map(wrapper => wrapper.credential) || []

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
        presentation, credential, extensions: extensions.registry,
        // kind: VALIDATION_KIND_OFFER @TODO we don't have claim on server side
      })

      res.json(result)
    } catch (e) {
      res.status(500).send(`${e}`)
    }
  })

  router.post(SERVER_VALIDATE_REQUEST, async (req, res) => {
    try {
      const { handler, extensions } = getAppContext(req)
      if (!handler.wallet) {
        throw ERROR_NO_WALLET
      }

      const response: Presentation = req.body

      const result = (
        await Promise.all(normalizeValue(response.verifiableCredential).map(
          async credential => {
            if (!handler.wallet) {
              return undefined
            }

            try {
              const facotry = extensions.registry.getFactory(credential.type)
              const validationResult = await facotry.validate(handler.wallet, {
                presentation: response, credential, extensions: extensions.registry
              })

              return validationResult
            } catch (e) {
              console.error('Validation failed', e)
              const res: ValidationResult = {
                valid: false,
                trusted: false,
                evidence: [],
                cause: `${e}`
              }

              return res
            }
          }
        ))
      ).filter(result => result)

      res.json({ ok: result.every(result => result?.valid), result })
    } catch (e) {
      res.status(500).send(`${e}`)
    }
  })

  router.post(SERVER_CREATE_REQUEST, async (req, res) => {
    try {
      const { handler, extensions } = getAppContext(req)
      if (!handler.wallet) {
        throw ERROR_NO_WALLET
      }

      const requested: {
        types: { [key: string]: MaybeArray<string> },
        holder: string
      } = req.body

      const request = await defaultRequestMethod({
        mainType: 'MultiRequest',
        requestType: 'Request',
        credentialContext: {}
      })(handler.wallet, {
        unsignedRequest: (await Promise.all(Object.entries(requested.types).map(async ([type, issuer]) => {
          if (!handler.wallet) {
            return undefined
          }
          const unsignedRequest = await defaultBuildMethod({
            mainType: type,
            contextUrl: randomRequestUrl,
            credentialContext: randomRequestSchema['@context']
          })(handler.wallet, {
            extensions: extensions.registry,
            subjectData: { type, issuer, holder: requested.holder }
          })

          return unsignedRequest
        }))).filter(cred => cred) as UnsignedCredential[]
      })

      res.json(request)
    } catch (e) {
      res.status(500).send(`${e}`)
    }
  })

  return router
}