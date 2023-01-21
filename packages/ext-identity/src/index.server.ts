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

import { addObserverToSchema, ExtensionDetails, REGISTRY_TYPE_IDENTITIES } from "@owlmeans/regov-ssi-core"
import { APP_EVENT_PRODUCE_IDENTITY, buildServerExtension, ServerEventProduceIdentityParams } from "@owlmeans/regov-lib-node"
import { BASIC_IDENTITY_TYPE, BuildExtensionParams, buildIdentityExtension } from "./ext"
import { REGOV_IDENTITY_DEFAULT_NAMESPACE } from "./types"
import { ERROR_NO_EXENSION, buildRouter } from "./server"


export const buildIdentityExtensionServer = (
  type: string,
  params: BuildExtensionParams,
  details: ExtensionDetails,
  ns = REGOV_IDENTITY_DEFAULT_NAMESPACE
) => {
  const extension = buildIdentityExtension(type, params, {
    ...details,
    name: details.name === '' ? 'extension.details.name' : details.name,
  }, ns)

  extension.schema = addObserverToSchema(extension.schema, {
    trigger: APP_EVENT_PRODUCE_IDENTITY,
    filter: async wallet => !wallet.getIdentity(),
    method: async (wallet, params: ServerEventProduceIdentityParams) => {
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

  const serverExtension = buildServerExtension(extension, buildRouter)

  return serverExtension
}