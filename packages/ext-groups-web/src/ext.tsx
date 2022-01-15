// import React from 'react'

import {
  buildUIExtension, 
  ExtensionItemPurpose, 
  EXTENSION_ITEM_PURPOSE_CREATION, 
  EXTENSION_ITEM_PURPOSE_ITEM, 
  UIExtensionFactoryProduct,
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
import { GroupCreation, GroupItem } from './component'


if (groupsExtension.localization) {
  groupsExtension.localization.translations['en'] = commonEn
}

export const groupsUIExtension = buildUIExtension<RegovGroupExtensionTypes>(groupsExtension,
  (purpose: ExtensionItemPurpose, type?: RegovGroupExtensionTypes) => {
    switch (purpose) {
      case EXTENSION_ITEM_PURPOSE_CREATION:
        switch (type) {
          case REGOV_CREDENTIAL_TYPE_GROUP:
            return [{
              com: GroupCreation(groupsExtension),
              extensionCode: `${groupsExtension.schema.details.code}GroupCreation`,
              params: {},
              order: 0
            }] as UIExtensionFactoryProduct<{}>[]
        }
      case EXTENSION_ITEM_PURPOSE_ITEM:
        switch (type) {
          case REGOV_CREDENTIAL_TYPE_GROUP:
            return [{
              com: GroupItem(groupsExtension),
              extensionCode: `${groupsExtension.schema.details.code}GroupItem`,
              params: {},
              order: 0
            }] as UIExtensionFactoryProduct<{}>[]
        }
    }
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