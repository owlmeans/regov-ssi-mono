// import React from 'react'

import {
  buildUIExtension, ExtensionItemPurpose,
} from '@owlmeans/regov-lib-react'
import {
  groupsExtension,
  RegovGroupExtensionTypes,
  REGOV_CREDENTIAL_TYPE_GROUP
} from '@owlmeans/regov-ext-groups'
import {
  MENU_TAG_CRED_NEW
} from '@owlmeans/regov-mold-wallet-web'
import { commonEn } from './i18n'


if (groupsExtension.localization) {
  groupsExtension.localization.translations['en'] = commonEn
}

export const groupsUIExtension = buildUIExtension<RegovGroupExtensionTypes>(groupsExtension,
  (_purpose: ExtensionItemPurpose, _type?: RegovGroupExtensionTypes) => {
    return []
  }
)

groupsUIExtension.menuItems = [
  {
    title: 'menu.new.group',
    menuTag: MENU_TAG_CRED_NEW,
    ns: groupsExtension.localization?.ns,
    action: {
      path: '',
      params: {
        ext: groupsExtension.schema.details.code,
        type: REGOV_CREDENTIAL_TYPE_GROUP
      }
    }
  }
]