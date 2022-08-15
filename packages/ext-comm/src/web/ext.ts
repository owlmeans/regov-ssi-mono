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
import { EVENT_INIT_CONNECTION, InitCommEventParams } from "@owlmeans/regov-comm"
import { 
  buildUIExtension, ExtensionItemPurpose, EXTENSION_ITEM_PURPOSE_TOP_ACTION, UIExtensionFactoryProduct 
} from "@owlmeans/regov-lib-react"
import { buildCommExtension } from "../ext"
import { CommExtConfig } from "../types"
import { InboxButton } from './component'


export const buildCommUIExtension = (config: CommExtConfig) => {
  const commExtension = buildCommExtension(config)

  const initEvent = commExtension.getEvent(EVENT_INIT_CONNECTION)
  if (initEvent) {
    const initMethod = initEvent.method
    if (initMethod) {
      initEvent.method = async (wallet, params: InitCommEventParams) => {
        await initMethod(wallet, params)
        const helper = commExtension.didComm && commExtension.didComm[wallet.store.alias]
        if (helper) {
          params.statusHandle.defaultListener = {
            accept: async (conn) => {
              await helper.accept(conn)
            },
            receive: async (conn, cred) => {
              params.trigger && await params.trigger(conn, cred)
            }
          }
          await helper.addListener(params.statusHandle.defaultListener)
        }
      }
    }
  }

  return buildUIExtension(commExtension, (purpose: ExtensionItemPurpose) => {
    switch (purpose) {
      case EXTENSION_ITEM_PURPOSE_TOP_ACTION:
        return [{
          com: InboxButton(commExtension),
          extensionCode: `${commExtension.schema.details.code}InboxButton`,
          params: {},
          order: 0
        }] as UIExtensionFactoryProduct[]
    }
    return [] as UIExtensionFactoryProduct<{}>[]
  })
}