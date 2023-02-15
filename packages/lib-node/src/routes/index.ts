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

import {
  Presentation, singleValue, ERROR_NO_EXTENSION, REGISTRY_TYPE_IDENTITIES,
  REGISTRY_SECTION_PEER, RegistryType, REGISTRY_TYPE_CREDENTIALS, defaultRequestMethod,
  UnsignedCredential, MaybeArray, defaultBuildMethod, normalizeValue
} from '@owlmeans/regov-ssi-core'
import { Router } from 'express'
import { ERROR_NO_WALLET, getAppContext } from '../app'
import {
  ERROR_NO_CREDENTIAL, SERVER_ALL_TRUSTED_TYPES, SERVER_ALL_TRUSTED_VCS,
  SERVER_ALL_TYPE_CREDENTIALS, SERVER_CREATE_REQUEST, SERVER_VALIDATE_OFFER, SERVER_VALIDATE_REQUEST
} from '../types'


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
          credential => {
            if (!handler.wallet) {
              return undefined
            }
            const facotry = extensions.registry.getFactory(credential.type)

            return facotry.validate(handler.wallet, {
              presentation: response, credential, extensions: extensions.registry
            })
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
        types: string | { [key: string]: MaybeArray<string> },
        holder: string
      } = req.body

      /**
       * @TODO 1. Restore unused variables errors ✅
       * 2. Add possibility to make requests considering multiple types ✅
       * 3. Consider to make possibility to make a request from a particular identity ✅
       * 4. Consider to pass fields from the final client to a stanartized requests ✅
       */

      /**
       * + Request method params:
       * unsignedRequest: UnsignedCredential | UnsignedCredential[]
       * holder?: DIDDocument
       * requestType?: string
       * identity?: Credential
       */

      const request = await defaultRequestMethod({
        mainType: 'MultiRequest',
        requestType: 'Request',
        credentialContext: {}
      })(handler.wallet, {
        unsignedRequest: (await Promise.all(Object.entries(requested.types).map(([type, issuer]) => {
          if (!handler.wallet) {
            return undefined
          }
          // const ext = extensions.registry.getExtension(type)
          return defaultBuildMethod({
            mainType: type,
            contextUrl: 'https://schema.owlmeans.com/random-request.json',
            credentialContext: {
              '@version': 1.1,
              holder: "http://www.w3.org/2001/XMLSchema#string",
              type: "http://www.w3.org/2001/XMLSchema#string",
              issuer: {
                '@id': "https://schema.owlmeans.com/random-request.json#issuer",
                '@container': '@set'
              },
            }
          })(handler.wallet, {
            extensions: extensions.registry,
            subjectData: {
              type, issuer,
              holder: requested.holder,
            }
          })

          // const factory = ext.getFactory(
          //   (
          //     ext.schema.credentials as { [key: string]: CredentialDescription }
          //   )[type].requestType as string
          // )
          // return factory.build(handler.wallet, {
          //   extensions: extensions.registry,
          //   subjectData: {},
          // })
        }))).filter(cred => cred) as UnsignedCredential[]
      })

      /**
       * + Build method params:
       * didUnsigned?: DIDDocumentUnsinged
       * subjectData: Object
       * key?: CryptoKey
       * evidence?: MaybeArray<Evidence>
       * identity?: Credential
       * type?: CredentialType
       * schema?: MaybeArray<CredentialSchema>
       * context?: MultiSchema
       * extensions?: ExtensionRegistry
       */

      res.json(request)
    } catch (e) {
      res.status(500).send(`${e}`)
    }
  })

  return router
}