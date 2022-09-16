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

import { EVENT_INIT_CONNECTION, IncommigDocumentWithConn, InitCommEventParams } from "@owlmeans/regov-comm"
import {
  buildUIExtension, castMainModalHandler, EXRENSION_ITEM_PURPOSE_INPUT_DETAILS, EXTENSION_ITEM_PURPOSE_CLAIM, 
  EXTENSION_ITEM_PURPOSE_CREATION, EXTENSION_ITEM_PURPOSE_DASHBOARD_WIDGET,
  EXTENSION_ITEM_PURPOSE_ITEM, EXTENSION_ITEM_PURPOSE_REQUEST, EXTENSION_ITEM_PURPOSE_VALIDATION,
  MainModalAuthenticatedEventParams, PurposeListItemParams, UIExtensionFactoryProduct
} from "@owlmeans/regov-lib-react"
import { MENU_TAG_CRED_NEW, MENU_TAG_REQUEST_NEW, MENU_TAG_CLAIM_NEW } from "@owlmeans/regov-lib-react"
import { EXTENSION_TRIGGER_AUTHENTICATED, normalizeValue } from "@owlmeans/regov-ssi-core"
import {
  WalletWrapper, Credential, isCredential, isPresentation, Presentation, REGISTRY_TYPE_IDENTITIES
} from "@owlmeans/regov-ssi-core"
import {
  addObserverToSchema, EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED
} from "@owlmeans/regov-ssi-core"
import React from "react"
import {
  SignatureCreationWeb, SignatureItemWeb, SignatureView, SignatureRequestWeb, DashboardWidgetWeb,
  SignatureRequestItemWeb, SignatureRequestViewWeb, SignatureResponseWeb, SignatureRequestResponseWeb, ValidationWidget,
  PersonalIdClaim,
  SignatureClaimWeb,
  SignatureOfferWeb
} from "./component"
import { ClaimSignatureItemParams, SignatureClaimItem } from "./component/web/claim-item"
import { signatureExtension } from "./ext"
import { REGOV_CREDENTIAL_TYPE_SIGNATURE, REGOV_CRED_PERSONALID, REGOV_SIGNATURE_CLAIM_TYPE, REGOV_SIGNATURE_REQUEST_TYPE, REGOV_SIGNATURE_RESPONSE_TYPE, SignaturePresentation } from "./types"
import { getSignatureRequestFromPresentation, getSignatureRequestOwner } from "./util"


if (signatureExtension.schema.events) {
  const modalHandler = castMainModalHandler(signatureExtension)

  signatureExtension.modifyEvent(EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED, 'method', async (
    wallet: WalletWrapper, params: IncommigDocumentWithConn
  ) => {
    console.log('Ready to open signature')
    params.statusHandler.successful = false
    if (!modalHandler.handle) {
      return false
    }

    const modalHandle = modalHandler.handle.upgrade(params)

    if (modalHandle.open) {
      console.log('Can open signature')
      if (isCredential(params.credential)) {
        params.statusHandler.successful = modalHandle.open(
          () => <SignatureView ext={signatureExtension} close={modalHandle.close}
            credential={params.credential as Credential} />
        )
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
            params.statusHandler.successful = modalHandle.open(
              () => <SignatureRequestViewWeb ext={signatureExtension} close={modalHandle.close}
                credential={params.credential as Presentation} />
            )
          } else {
            params.statusHandler.successful = modalHandle.open(
              () => <SignatureResponseWeb ext={signatureExtension} close={modalHandle.close}
                credential={params.credential as Presentation} />
            )
          }
        } else if (normalizeValue(params.credential.type).includes(REGOV_SIGNATURE_RESPONSE_TYPE)) {
          params.statusHandler.successful = modalHandle.open(
            () => <SignatureRequestResponseWeb ext={signatureExtension} close={modalHandle.close}
              credential={params.credential as Presentation} />
          )
        } else if (normalizeValue(params.credential.type).includes(REGOV_SIGNATURE_CLAIM_TYPE)) {
          console.log('Claim to open detected')
          if (params.conn) {
            console.log('Connection provided. Open signature claim.')
            params.statusHandler.successful = modalHandle.open(
              () => params.conn && <SignatureOfferWeb close={modalHandle.close} conn={params.conn}
                claim={params.credential as SignaturePresentation} />
            )
          }
        }
      }

      if (params.statusHandler.successful) {
        return true
      }
    }

    return false
  })
}

signatureExtension.schema = addObserverToSchema(signatureExtension.schema, {
  trigger: EXTENSION_TRIGGER_AUTHENTICATED,
  method: async (wallet, params: MainModalAuthenticatedEventParams) => {
    const statusHandle = { established: false }
    params.extensions.triggerEvent<InitCommEventParams>(wallet, EVENT_INIT_CONNECTION, {
      statusHandle,
      trigger: async (conn, doc) => {
        if (isPresentation(doc)) {
          params.extensions.triggerEvent<IncommigDocumentWithConn>(
            wallet, EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED, {
            conn, credential: doc, statusHandler: { successful: false }, 
            cleanUp: () => {}
          })
        }
      }
    })
  }
})

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
    case EXTENSION_ITEM_PURPOSE_CLAIM:
      switch (type) {
        case REGOV_CREDENTIAL_TYPE_SIGNATURE:
          return [{
            com: SignatureClaimWeb(signatureExtension),
            extensionCode: `${signatureExtension.schema.details.code}SignatureClaim`,
            params: {},
            order: 0
          }]
      }
    case EXTENSION_ITEM_PURPOSE_ITEM:
      switch (type) {
        case REGOV_SIGNATURE_CLAIM_TYPE:
          return [{
            com: SignatureClaimItem(signatureExtension),
            extensionCode: `${signatureExtension.schema.details.code}SignatureItem`,
            params: {},
            order: 0
          }] as UIExtensionFactoryProduct<ClaimSignatureItemParams>[]
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
    case EXRENSION_ITEM_PURPOSE_INPUT_DETAILS:
      switch (type) {
        case REGOV_CRED_PERSONALID:
          return [{
            com: PersonalIdClaim(signatureExtension),
            extensionCode: `${signatureExtension.schema.details.code}PersonalIdClaim`,
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
  },
  {
    title: 'menu.claim.signature',
    menuTag: MENU_TAG_CLAIM_NEW,
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