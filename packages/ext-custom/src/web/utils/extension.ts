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
  EXTENSION_ITEM_PURPOSE_CLAIM, EXTENSION_ITEM_PURPOSE_ITEM, EXTENSION_ITEM_PURPOSE_ROUTE, ManuItemParams,
  MENU_TAG_CLAIM_NEW, MENU_TAG_REQUEST_NEW, UIExtension, UIExtensionFactoryProduct
} from "@owlmeans/regov-lib-react"
import { singleValue } from "@owlmeans/regov-ssi-core"
import { CustomDescription, isCustom } from "../../custom.types"
import { updateFactories } from "../../utils/extension"
import { ClaimCreate } from "../component/claim/create"
import { ClaimPreview } from "../component/claim/preview"
import { ClaimItem } from "../component/claim/item"
import { makeClaimPreviewPath } from "./router"


export const customizeExtension = (ext: UIExtension): UIExtension => (
  {
    ...ext,
    extension: updateFactories(ext.extension),
    menuItems: [...(ext.menuItems || []), ...expandMenu(ext)],
    produceComponent: (purpose, type) => {
      const _type = singleValue(type)
      if (_type && ext.extension.schema.credentials && ext.extension.schema.credentials[_type]) {
        console.log('???', purpose, type, _type)
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

          }
        }
        if (cred.sourceType && ext.extension.schema.credentials[cred.sourceType]) {
          const sourceCred = ext.extension.schema.credentials[cred.sourceType]
          if (isCustom(sourceCred)) {
            switch (purpose) {
              case EXTENSION_ITEM_PURPOSE_ITEM:
                return [{
                  com: ClaimItem(),
                  extensionCode: `${ext.extension.schema.details.code}${cred.mainType}ClaimItem`,
                  params: {},
                  order: 0
                }]
            }
          }
        }
      }
      if (ext.extension.schema.credentials) {
        switch (purpose) {
          case EXTENSION_ITEM_PURPOSE_ROUTE:
            return [...Object.entries(ext.extension.schema.credentials).flatMap(
              ([, cred]) => isCustom(cred) ? [{
                com: ClaimPreview(ext.extension, cred),
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
)

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