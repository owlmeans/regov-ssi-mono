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
  buildUIExtension, EXTENSION_ITEM_PURPOSE_CREATION, EXTENSION_ITEM_PURPOSE_DASHBOARD_WIDGET,
  EXTENSION_ITEM_PURPOSE_ITEM, EXTENSION_ITEM_PURPOSE_REQUEST, EXTENSION_ITEM_PURPOSE_VALIDATION, EXTENSION_TIRGGER_MAINMODAL_SHARE_HANDLER,
  MainModalHandle, MainModalShareEventParams, PurposeListItemParams, UIExtensionFactoryProduct
} from "@owlmeans/regov-lib-react"
import { MENU_TAG_CRED_NEW, MENU_TAG_REQUEST_NEW } from "@owlmeans/regov-lib-react"
import { normalizeValue } from "@owlmeans/regov-ssi-core"
import {
  WalletWrapper, Credential, isCredential, isPresentation, Presentation, REGISTRY_TYPE_IDENTITIES
} from "@owlmeans/regov-ssi-core"
import {
  addObserverToSchema, EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED, IncommigDocumentEventParams
} from "@owlmeans/regov-ssi-core"
import React from "react"
import {
  SignatureCreationWeb, SignatureItemWeb, SignatureView, SignatureRequestWeb, DashboardWidgetWeb,
  SignatureRequestItemWeb, SignatureRequestViewWeb, SignatureResponseWeb, SignatureRequestResponseWeb, ValidationWidget
} from "./component"
import { signatureExtension } from "./ext"
import { REGOV_CREDENTIAL_TYPE_SIGNATURE, REGOV_SIGNATURE_REQUEST_TYPE, REGOV_SIGNATURE_RESPONSE_TYPE } from "./types"
import { getSignatureRequestFromPresentation, getSignatureRequestOwner } from "./util"


if (signatureExtension.schema.events) {
  let modalHandler: MainModalHandle

  signatureExtension.schema = addObserverToSchema(signatureExtension.schema, {
    trigger: EXTENSION_TIRGGER_MAINMODAL_SHARE_HANDLER,
    method: async (_, params: MainModalShareEventParams) => {
      modalHandler = params.handle

      return false
    }
  })

  signatureExtension.modifyEvent(EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED, 'method', async (
    wallet: WalletWrapper, params: IncommigDocumentEventParams
  ) => {
    params.statusHandler.successful = false

    const close = () => {
      params.cleanUp()
      modalHandler.setOpen && modalHandler.setOpen(false)
    }

    if (modalHandler) {
      if (isCredential(params.credential)) {
        modalHandler.getContent = () => <SignatureView ext={signatureExtension} close={close}
          credential={params.credential as Credential} />

        params.statusHandler.successful = true
      } else if (isPresentation(params.credential)) {
        if (normalizeValue(params.credential.type).includes(REGOV_SIGNATURE_REQUEST_TYPE)) {
          let isOwner = false
          const request = getSignatureRequestFromPresentation(params.credential)
          if (request) {
            const owner = getSignatureRequestOwner(request)
            const registry = wallet.getRegistry(REGISTRY_TYPE_IDENTITIES)
            isOwner = !!registry.getCredential(owner?.id)
          }
          if (isOwner) {
            modalHandler.getContent = () => <SignatureRequestViewWeb ext={signatureExtension} close={close}
              credential={params.credential as Presentation} />

            params.statusHandler.successful = true
          } else {
            modalHandler.getContent = () => <SignatureResponseWeb ext={signatureExtension} close={close}
              credential={params.credential as Presentation} />

            params.statusHandler.successful = true
          }
        } else if (normalizeValue(params.credential.type).includes(REGOV_SIGNATURE_RESPONSE_TYPE)) {
          modalHandler.getContent = () => <SignatureRequestResponseWeb ext={signatureExtension} close={close}
            credential={params.credential as Presentation} />

          params.statusHandler.successful = true
        }
      }

      if (params.statusHandler.successful && modalHandler.setOpen) {
        modalHandler.setOpen(true)

        return true
      }
    }

    return false
  })
}

export const signatureWebExtension = buildUIExtension(signatureExtension, (purpose, type?) => {
  switch (purpose) {
    case EXTENSION_ITEM_PURPOSE_CREATION:
      switch (type) {
        case REGOV_CREDENTIAL_TYPE_SIGNATURE:
          return [{
            com: SignatureCreationWeb(signatureExtension),
            extensionCode: `${signatureExtension.schema.details.code}SignatureCreation`,
            params: {},
            order: 0
          }]
      }
    case EXTENSION_ITEM_PURPOSE_REQUEST:
      switch (type) {
        case REGOV_CREDENTIAL_TYPE_SIGNATURE:
          return [{
            com: SignatureRequestWeb(signatureExtension),
            extensionCode: `${signatureExtension.schema.details.code}SignatureRequest`,
            params: {},
            order: 0
          }]
      }
    case EXTENSION_ITEM_PURPOSE_ITEM:
      switch (type) {
        case REGOV_CREDENTIAL_TYPE_SIGNATURE:
          return [{
            com: SignatureItemWeb(signatureExtension),
            extensionCode: `${signatureExtension.schema.details.code}SignatureItem`,
            params: {},
            order: 0
          }] as UIExtensionFactoryProduct<PurposeListItemParams>[]
        case REGOV_SIGNATURE_REQUEST_TYPE:
          return [{
            com: SignatureRequestItemWeb(signatureExtension),
            extensionCode: `${signatureExtension.schema.details.code}SignatureRequestItem`,
            params: {},
            order: 0
          }] 
      }
    case EXTENSION_ITEM_PURPOSE_DASHBOARD_WIDGET:
      return [{
        com: DashboardWidgetWeb(signatureExtension),
        extensionCode: `${signatureExtension.schema.details.code}DashboardWidget`,
        params: {},
        order: 0
      }]
    case EXTENSION_ITEM_PURPOSE_VALIDATION:
      switch (type) {
        case REGOV_CREDENTIAL_TYPE_SIGNATURE:
          return [{
            com: ValidationWidget(signatureExtension),
            extensionCode: `${signatureExtension.schema.details.code}ValidationWidget`,
            params: {},
            order: 0
          }]
      }
  }

  return [] as UIExtensionFactoryProduct<{}>[]
})

signatureWebExtension.menuItems = [
  {
    title: 'menu.new.signature',
    menuTag: MENU_TAG_CRED_NEW,
    ns: signatureExtension.localization?.ns,
    action: {
      path: '',
      params: {
        ext: signatureExtension.schema.details.code,
        type: REGOV_CREDENTIAL_TYPE_SIGNATURE
      }
    }
  },
  {
    title: 'menu.request.signature',
    menuTag: MENU_TAG_REQUEST_NEW,
    ns: signatureExtension.localization?.ns,
    action: {
      path: '',
      params: {
        ext: signatureExtension.schema.details.code,
        type: REGOV_CREDENTIAL_TYPE_SIGNATURE
      }
    }
  }
]