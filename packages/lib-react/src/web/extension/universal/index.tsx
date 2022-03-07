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

import { ExtensionDetails, buildUniversalExtension, UniversalCredentialT } from '@owlmeans/regov-ssi-core'
import { 
  buildUIExtension, UIExtensionFactoryProduct, ExtensionItemPurpose, EXTENSION_ITEM_PURPOSE_ROUTE,
} from '../../../common'
import en from './i18n/en.json'
import { Main } from './component/main'
import {  UNIVERSAL_CREDENTAIL_I18N_NS,  UNIVERSAL_EXTENSION_SCREEN_PATH } from './types'


export const buildUniversalExtensionUI = (
  details: ExtensionDetails,
  ns = UNIVERSAL_CREDENTAIL_I18N_NS
) => {
  type CredType = UniversalCredentialT

  const extension = buildUniversalExtension({
    ...details,
    name: 'extension.details.name',
  })

  extension.localization = {
    ns, translations: { en }
  }

  const uiExt = buildUIExtension(
    extension,
    (purpose: ExtensionItemPurpose, _?: CredType) => {
      switch (purpose) {
        case EXTENSION_ITEM_PURPOSE_ROUTE:
          return [
            {
              com: Main(extension),
              extensionCode: details.code,
              params: { path: `${UNIVERSAL_EXTENSION_SCREEN_PATH}/:tab` }
            }
          ] as UIExtensionFactoryProduct<{}>[]
      }
      
      return [] as UIExtensionFactoryProduct<{}>[]
    }
  )

  uiExt.menuItems = [
    {
      ns,
      title: 'menu.main',
      action: `${UNIVERSAL_EXTENSION_SCREEN_PATH}/read`
    }
  ]

  return uiExt
}

