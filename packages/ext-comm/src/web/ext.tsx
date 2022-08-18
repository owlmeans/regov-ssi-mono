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
import React from 'react'
import {
  buildUIExtension, castMainModalHandler, ExtensionItemPurpose, EXTENSION_ITEM_PURPOSE_TOP_ACTION, 
  UIExtensionFactoryProduct
} from "@owlmeans/regov-lib-react"
import { addObserverToSchema, EventParams } from "@owlmeans/regov-ssi-core"
import { buildCommExtension } from "../ext"
import { CommExtConfig } from "../types"
import { InboxButton, InboxWidget } from './component'
import { EXTENSION_TRIGGER_OPEN_INBOX } from "./types"


export const buildCommUIExtension = (config: CommExtConfig) => {
  const commExtension = buildCommExtension(config)

  const uiExtension = buildUIExtension(commExtension, (purpose: ExtensionItemPurpose) => {
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

  const modalHandler = castMainModalHandler(commExtension)

  commExtension.schema = addObserverToSchema(commExtension.schema, {
    trigger: EXTENSION_TRIGGER_OPEN_INBOX,
    method: async (_, __: EventParams) => {
      const close = () => {
        modalHandler.handle && modalHandler.handle.setOpen && modalHandler.handle.setOpen(false)
      }

      if (modalHandler.handle) {
        const Widget = InboxWidget(commExtension)

        modalHandler.handle.getContent = () => <Widget close={close}/>
        modalHandler.handle.setOpen && modalHandler.handle.setOpen(true)
      }
    }
  })

  return uiExtension
}