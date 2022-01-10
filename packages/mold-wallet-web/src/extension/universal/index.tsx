import {
  ExtensionDetails,
  buildUniversalExtension,
  UniversalCredentialT,
} from '@owlmeans/regov-ssi-extension'

import {
  buildUIExtension,
  UIExtensionFactoryProduct,
  ExtensionItemPurpose,
  EXTENSION_ITEM_PURPOSE_ROUTE,
} from '@owlmeans/regov-lib-react'

import en from './i18n/en.json'
import { Main } from './component/main'
import { 
  UniversalCredentailExtensionUI, 
  UNIVERSAL_CREDENTAIL_I18N_NS, 
  UNIVERSAL_EXTENSION_SCREEN_PATH 
} from './types'

export { UniversalCredentailExtension } from '@owlmeans/regov-ssi-extension'


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

  const uiExt = buildUIExtension<CredType>(
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

  return uiExt as UniversalCredentailExtensionUI
}

