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

import React from "react"
import { buildUIExtension, castMainModalHandler, ExtensionItemPurpose, EXTENSION_ITEM_PURPOSE_ITEM, MainModalAuthenticatedEventParams, PurposeListItemParams, UIExtensionFactoryProduct } from "@owlmeans/regov-lib-react"
import { addObserverToSchema, EXTENSION_TRIGGER_AUTHENTICATED, isPresentation } from "@owlmeans/regov-ssi-core"
import { authExtension } from "../../ext"
import { DIDAuthResponse } from './component'
import { REGOV_AUTH_REQUEST_TYPE } from "../../types"
import { EVENT_INIT_CONNECTION, InitCommEventParams } from "@owlmeans/regov-comm"
import { AuthRequestItem } from "../component"


const modalHandler = castMainModalHandler(authExtension)

authExtension.schema = addObserverToSchema(authExtension.schema, {
  trigger: EXTENSION_TRIGGER_AUTHENTICATED,
  method: async (wallet, params: MainModalAuthenticatedEventParams) => {
    const statusHandle = {
      established: false,
    }
    params.extensions.triggerEvent<InitCommEventParams>(wallet, EVENT_INIT_CONNECTION, {
      statusHandle,
      trigger: async (conn, doc) => {
        if (!modalHandler.handle) {
          return
        }
        const close = () => {
          modalHandler?.handle?.setOpen && modalHandler.handle.setOpen(false)
        }

        if (isPresentation(doc)) {
          if (doc.type.includes(REGOV_AUTH_REQUEST_TYPE)) {
            modalHandler.handle.getContent = () =>
              <DIDAuthResponse request={doc} conn={conn} connection={statusHandle} close={close} />

            if (modalHandler.handle.setOpen) {
              modalHandler.handle.setOpen(true)
            }
          }
        }
      },
      rejectConnection: async (err) => {
        console.error(err)
      }
    })
  }
})

export const authUIExtension = buildUIExtension(authExtension,
  (purpose: ExtensionItemPurpose, type?: string) => {
    switch (purpose) {
      case EXTENSION_ITEM_PURPOSE_ITEM:
        switch (type) {
          case REGOV_AUTH_REQUEST_TYPE:
            return [{
              com: AuthRequestItem(authExtension),
              extensionCode: `${authExtension.schema.details.code}AuthRequestItem`,
              params: {},
              order: 0
            }] as UIExtensionFactoryProduct<PurposeListItemParams>[]
        }
    }
    return [] as UIExtensionFactoryProduct<{}>[]
  }
)