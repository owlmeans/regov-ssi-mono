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
  CommConnectionStatusHandler, InitCommEventParams, EVENT_INIT_CONNECTION
} from "@owlmeans/regov-comm"
import { useRegov } from "@owlmeans/regov-lib-react"
import { CredentialsRegistryWrapper, ExtensionRegistry, REGISTRY_SECTION_PEER, WalletHandler } from "@owlmeans/regov-ssi-core"
import { IncommingCrednetialSubject, IncommingMeta, IncommingPresentation, REGISTRY_TYPE_INBOX } from "./types"


export const handleIncommingCommDocuments = (handler?: WalletHandler, extensions?: ExtensionRegistry) => {
  const statusHandle: CommConnectionStatusHandler = { established: false }
  if (handler?.wallet && extensions) {
    const registry = handler.wallet?.getRegistry(REGISTRY_TYPE_INBOX)
    extensions.triggerEvent<InitCommEventParams>(handler.wallet, EVENT_INIT_CONNECTION, {
      statusHandle,
      trigger: async (conn, doc) => {
        if (registry) {
          if (!registry.getCredential(doc.id, REGISTRY_SECTION_PEER)) {
            console.info(`ext-comm: received message: ${doc.id}`)
            const wrapper = await registry.addCredential<
              IncommingCrednetialSubject, IncommingPresentation, IncommingMeta
            >(doc as IncommingPresentation, REGISTRY_SECTION_PEER)

            wrapper.meta.conn = conn

            handler.notify()
          }
        }
      }
    })
  }

  return statusHandle
}

export const useInboxRegistry = () => 
  useRegov().handler.wallet?.getRegistry(REGISTRY_TYPE_INBOX) as CredentialsRegistryWrapper