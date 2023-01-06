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
  EXTENSION_ITEM_PURPOSE_CLAIM, EXTENSION_ITEM_PURPOSE_ITEM, EXTENSION_ITEM_PURPOSE_ROUTE, ManuItemParams,
  MENU_TAG_CLAIM_NEW, MENU_TAG_REQUEST_NEW, UIExtension, UIExtensionFactoryProduct, castMainModalHandler
} from "@owlmeans/regov-lib-react"
import {
  addObserverToSchema, Extension, EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED, isPresentation, META_ROLE_CLAIM, 
  META_ROLE_OFFER, singleValue
} from "@owlmeans/regov-ssi-core"
import { CustomDescription, DefaultDescription, DefaultPresentation, isCustom } from "../../custom.types"
import { updateFactories } from "../../utils/extension"
import { ClaimCreate } from "../component/claim/create"
import { ClaimPreview } from "../component/claim/preview"
import { ClaimItem } from "../component/claim/item"
import { makeClaimPreviewPath } from "./router"
import { IncommigDocumentWithConn } from "@owlmeans/regov-comm"
import { OfferCreate } from "../component/offer/create"
import { OfferItem } from '../component/offer/item'
import { OfferReview } from '../component/offer/review'
import { CredentialItem } from '../component/credential/item'
import { CredentialView } from '../component/credential/view'


export const customizeExtension = (ext: UIExtension): UIExtension => {
  const modalHandler = castMainModalHandler(ext.extension)
  ext.extension.schema = addObserverToSchema(ext.extension.schema, {
    trigger: EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED,
    filter: async (_, params: IncommigDocumentWithConn) => {
      if (isPresentation(params.credential)) {
        const cred = singleValue(params.credential.verifiableCredential)
        return (ext.extension.schema.credentials && Object.entries(ext.extension.schema.credentials).reduce(
          (result, [, descr]) => result || !!cred?.type.includes(descr.mainType), false
        )) as boolean
      }
      return (ext.extension.schema.credentials && Object.entries(ext.extension.schema.credentials).reduce(
        (result, [, descr]) => result || !!params.credential.type.includes(descr.mainType), false
      )) as boolean
    },
    method: async (_, params: IncommigDocumentWithConn) => {
      return ext.extension.schema.credentials && Object.entries(ext.extension.schema.credentials).some(
        ([, cred]) => {
          if (isPresentation(params.credential) && cred.sourceType && cred.metaRole) {
            if (params.credential.type.includes(cred.mainType) && ext.extension.schema.credentials
              && ext.extension.schema.credentials[cred.sourceType]) {
              const sourceCred = ext.extension.schema.credentials[cred.sourceType]
              switch (cred.metaRole) {
                case META_ROLE_CLAIM:
                  // @TODO - we need to add additional check: should we show something like claim prview 
                  // or offer create depending on who open's the claim
                  return params.statusHandler.successful =
                    modalHandler.handle?.open ? modalHandler.handle.open(
                      () => <OfferCreate ext={params.ext as Extension} descr={sourceCred as DefaultDescription}
                        claim={params.credential as DefaultPresentation} conn={params.conn}
                        close={modalHandler.handle?.close} />
                    ) : false
                case META_ROLE_OFFER:
                  return params.statusHandler.successful =
                    modalHandler.handle?.open ? modalHandler.handle.open(
                      () => <OfferReview ext={params.ext as Extension} descr={sourceCred as DefaultDescription}
                        offer={params.credential as DefaultPresentation} conn={params.conn}
                        close={modalHandler.handle?.close} />
                    ) : false
              }
            }
          } else if (params.credential.type.includes(cred.mainType) && isCustom(cred)) {
            return params.statusHandler.successful =
              modalHandler.handle?.open ? modalHandler.handle.open(
                () => <CredentialView ext={params.ext as Extension} descr={cred as DefaultDescription}
                  offer={params.credential as DefaultPresentation} conn={params.conn}
                  close={modalHandler.handle?.close} />
              ) : false
          }
          return false
        }
      )
    }
  })

  return {
    ...ext,
    extension: updateFactories(ext.extension),
    menuItems: [...(ext.menuItems || []), ...expandMenu(ext)],
    produceComponent: (purpose, type) => {
      const _type = singleValue(type)
      if (_type && ext.extension.schema.credentials && ext.extension.schema.credentials[_type]) {
        const cred = ext.extension.schema.credentials[_type]
        if (isCustom(cred)) {
          switch (purpose) {
            case EXTENSION_ITEM_PURPOSE_CLAIM:
              return [{
                com: ClaimCreate(ext.extension, cred),
                extensionCode: `${ext.extension.schema.details.code}${cred.mainType}Claim`,
                params: {},
                order: 0
              }]
            case EXTENSION_ITEM_PURPOSE_ITEM:
              return [{
                com: CredentialItem(cred),
                extensionCode: `${ext.extension.schema.details.code}${cred.mainType}CredItem`,
                params: {},
                order: 0
              }]
          }
        }
        if (cred.sourceType && ext.extension.schema.credentials[cred.sourceType]) {
          const sourceCred = ext.extension.schema.credentials[cred.sourceType]
          if (isCustom(sourceCred)) {
            switch (purpose) {
              case EXTENSION_ITEM_PURPOSE_ITEM:
                switch (cred.metaRole) {
                  case META_ROLE_CLAIM:
                    return [{
                      com: ClaimItem(sourceCred),
                      extensionCode: `${ext.extension.schema.details.code}${cred.mainType}ClaimItem`,
                      params: {},
                      order: 0
                    }]
                  case META_ROLE_OFFER:
                    return [{
                      com: OfferItem(sourceCred),
                      extensionCode: `${ext.extension.schema.details.code}${cred.mainType}OfferItem`,
                      params: {},
                      order: 0
                    }]
                }
            }
          }
        }
      }
      if (ext.extension.schema.credentials) {
        switch (purpose) {
          case EXTENSION_ITEM_PURPOSE_ROUTE:
            return [...Object.entries(ext.extension.schema.credentials).flatMap(
              ([, cred]) => isCustom(cred) ? [{
                com: ClaimPreview(cred),
                extensionCode: `${ext.extension.schema.details.code}${cred.mainType}ClaimPreview`,
                params: { path: makeClaimPreviewPath(cred) },
                order: 0
              }] : []
            ), ...ext.produceComponent(purpose, type)] as UIExtensionFactoryProduct<{}>[]
        }
      }

      return ext.produceComponent(purpose, type)
    }
  }
}

const expandMenu = (ext: UIExtension): ManuItemParams[] =>
  ext.extension.schema.credentials ? Object.entries(ext.extension.schema.credentials).filter(
    ([, cred]) => isCustom(cred)
  ).flatMap(
    ([, cred]: [string, CustomDescription]) => {
      return [
        {
          title: `menu.request.${cred.mainType}`,
          ns: cred.ns,
          menuTag: MENU_TAG_REQUEST_NEW,
          action: {
            path: '',
            params: {
              ext: ext.extension.schema.details.code,
              type: cred.mainType
            }
          }
        },
        {
          title: `menu.claim.${cred.mainType}`,
          ns: cred.ns,
          menuTag: MENU_TAG_CLAIM_NEW,
          action: {
            path: '',
            params: {
              ext: ext.extension.schema.details.code,
              type: cred.mainType
            }
          }
        }
      ]
    }
  ) : []