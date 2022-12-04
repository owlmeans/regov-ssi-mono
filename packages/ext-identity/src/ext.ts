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
  addObserverToSchema, buildExtension, buildExtensionSchema, ExtensionDetails,
  defaultBuildMethod, EXTENSION_TRIGGER_AUTHENTICATED, EXTENSION_TRIGGER_RETRIEVE_NAME,
  RetreiveNameEventParams, isCredential, IncommigDocumentEventParams, EXTENSION_TRIGGER_INIT_SENSETIVE,
  EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED, REGISTRY_SECTION_OWN, EXTENSION_TRIGGER_PRODUCE_IDENTITY,
  InitSensetiveEventParams
} from "@owlmeans/regov-ssi-core"
import {
  getCompatibleSubject, REGISTRY_TYPE_IDENTITIES, UnsignedCredential
} from "@owlmeans/regov-ssi-core"
import { IdentitySubject, REGOV_IDENTITY_DEFAULT_NAMESPACE, REGOV_IDENTITY_DEFAULT_TYPE, ERROR_NO_EXENSION } from "./types"
import { makeRandomUuid } from "@owlmeans/regov-ssi-core"
import { credIdToIdentityId } from "./helper"
import en from './i18n/en.json'
import ru from './i18n/ru.json'
import by from './i18n/by.json'


export const BASIC_IDENTITY_TYPE = 'Identity'

export const buildIdentityExtension = (
  type: string, params: BuildExtensionParams, details: ExtensionDetails,
  ns = REGOV_IDENTITY_DEFAULT_NAMESPACE
) => {
  const identityType = type || 'OwlMeans:Regov:Identity'

  type IdentityCredentials = typeof identityType

  details.defaultCredType = identityType
  let schema = buildExtensionSchema<IdentityCredentials>(details, {
    [identityType]: {
      mainType: identityType,
      mandatoryTypes: [BASIC_IDENTITY_TYPE],
      defaultNameKey: 'cred.type.identity.name',
      contextUrl: 'https://schema.owlmeans.com/identity.json',
      credentialContext: {
        '@version': 1.1,
        identifier: "http://www.w3.org/2001/XMLSchema#string",
        sourceApp: "http://www.w3.org/2001/XMLSchema#string",
        uuid: "http://www.w3.org/2001/XMLSchema#string",
        createdAt: "http://www.w3.org/2001/XMLSchema#datetime"
      },
      /**
       * @TODO Load from file. Should be a valid credential
       * with a subject that describe the way that the tested
       * credential subject should be verified.
       */
      // credentialSchema: {}
      registryType: REGISTRY_TYPE_IDENTITIES,
      verfiableId: {
        fields: ['sourceApp', 'uuid', 'createdAt']
      },
      defaultSubject: {
        sourceApp: params.appName
      }
    }
  })

  schema = addObserverToSchema(schema, {
    filter: async wallet => !wallet.hasIdentity(),
    trigger: EXTENSION_TRIGGER_AUTHENTICATED
  })

  schema = addObserverToSchema(schema, {
    trigger: EXTENSION_TRIGGER_INIT_SENSETIVE,
    filter: async (wallet) => {
      const registry = wallet.getRegistry(REGISTRY_TYPE_IDENTITIES)
      const creds = await registry.lookupCredentials(
        schema.details.defaultCredType || REGOV_IDENTITY_DEFAULT_TYPE,
        REGISTRY_SECTION_OWN
      )

      return creds.length < 1
    },
    method: async (wallet, params: InitSensetiveEventParams) => {
      const factory = extension.getFactory(
        schema.details.defaultCredType || REGOV_IDENTITY_DEFAULT_TYPE
      )
      const unsigned = await factory.build(wallet, {
        extensions: params.extensions, subjectData: {}
      })
      const identity = await factory.sign(wallet, { unsigned })

      const registry = wallet.getRegistry(REGISTRY_TYPE_IDENTITIES)
      const item = await registry.addCredential(identity)
      item.meta.title = 'Main ID'
      registry.registry.rootCredential = identity.id

      console.info('Sensetive: Identity initiated.')
    }
  })

  schema = addObserverToSchema(schema, {
    trigger: EXTENSION_TRIGGER_RETRIEVE_NAME,
    filter: async (_, params: RetreiveNameEventParams) => {
      if (!params.credential.type || !Array.isArray(params.credential.type)) {
        return false
      }

      return params.credential.type.includes(identityType)
    },

    method: async (_, { credential, setName }: RetreiveNameEventParams) => {
      const subject = getCompatibleSubject<IdentitySubject>(credential)
      setName(`ID: ${subject.identifier}`)
    }
  })

  schema = addObserverToSchema(schema, {
    trigger: EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED,
    filter: async (_, params: IncommigDocumentEventParams) => {
      if (!isCredential(params.credential)) {
        return false
      }

      if (!params.credential.type || !Array.isArray(params.credential.type)) {
        return false
      }

      return params.credential.type.includes(identityType)
    },
  })

  schema = addObserverToSchema(schema, {
    trigger: EXTENSION_TRIGGER_PRODUCE_IDENTITY,
    filter: async wallet => !wallet.getIdentity(),
    method: async (wallet, params: InitSensetiveEventParams) => {
      console.log('EXTENSION_TRIGGER_PRODUCE_IDENTITY')
      const { ext } = params
      if (!ext) {
        throw ERROR_NO_EXENSION
      }
      const factory = ext.getFactory(ext.schema.details.defaultCredType || BASIC_IDENTITY_TYPE)
      const unsigned = await factory.build(wallet, {
        extensions: params.extensions, subjectData: {}
      })
      const identity = await factory.sign(wallet, { unsigned })

      const registry = wallet.getRegistry(REGISTRY_TYPE_IDENTITIES)

      const item = await registry.addCredential(identity)
      item.meta.title = 'Main ID'
      registry.registry.rootCredential = identity.id
    }
  })

  const extension = buildExtension(schema, {
    [identityType]: {
      produceBuildMethod: (credSchema) => async (wallet, params) => {
        const inputData = params.subjectData as IdentitySubject
        const updatedSubjectData = {
          ...credSchema.defaultSubject,
          ...inputData,
          createdAt: inputData.createdAt || (new Date).toISOString(),
          sourceApp: inputData.sourceApp || (credSchema.defaultSubject as any).sourceApp,
          uuid: makeRandomUuid()
        }

        const unsigned = await defaultBuildMethod(credSchema)(wallet, {
          ...params, subjectData: updatedSubjectData
        })

        updatedSubjectData.identifier = credIdToIdentityId(wallet, unsigned)

        return unsigned as unknown as UnsignedCredential
      }
    }
  })

  extension.localization = { ns, translations: {} }
  if (ns === REGOV_IDENTITY_DEFAULT_NAMESPACE) {
    extension.localization.translations = { en, ru, be: by }
  }

  return extension
}

export type BuildExtensionParams = {
  appName: string
}