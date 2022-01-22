import React from 'react'

import {
  buildUIExtension,
  ExtensionItemPurpose,
  EXTENSION_ITEM_PURPOSE_CREATION,
  EXTENSION_ITEM_PURPOSE_ITEM,
  UIExtensionFactoryProduct,
  PurposeListItemParams,
  PurposeCredentialCreationParams,
  MainModalHandle,
  EXTENSION_TIRGGER_MAINMODAL_SHARE_HANDLER,
  MainModalShareEventParams,
  EXTENSION_ITEM_PURPOSE_EVIDENCE,
  PurposeEvidenceWidgetParams,
} from '@owlmeans/regov-lib-react'
import {
  groupsExtension,
  RegovGroupExtensionTypes,
  REGOV_CREDENTIAL_TYPE_GROUP,
} from '@owlmeans/regov-ext-groups'
import {
  MENU_TAG_CRED_NEW
} from '@owlmeans/regov-mold-wallet-web'
import { commonEn } from './i18n'
import {
  GroupCreation,
  GroupItem,
  GroupView,
  EvidenceWidget
} from './component'
import {
  addObserverToSchema,
  EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED,
  IncommigDocumentEventParams
} from '@owlmeans/regov-ssi-extension'
import { RegovGroupUIExtension } from './types'
import {
  Credential
} from '@owlmeans/regov-ssi-core'


if (groupsExtension.localization) {
  groupsExtension.localization.translations['en'] = commonEn
}

if (groupsExtension.schema.events) {
  let modalHandler: MainModalHandle

  groupsExtension.getEvents(EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED)[0].method = async (
    _, params: IncommigDocumentEventParams<RegovGroupExtensionTypes>
  ) => {
    if (modalHandler) {
      modalHandler.getContent = () => <GroupView ext={groupsExtension}
        close={() => {
          params.cleanUp()
          modalHandler.setOpen && modalHandler.setOpen(false)
        }}
        credential={params.credential as Credential} />
      if (modalHandler.setOpen) {
        modalHandler.setOpen(true)
      }
      /**
       * @TODO Clean up processor on reset
       */

      params.statusHandler.successful = true

      return true
    }

    return false
  }

  groupsExtension.schema = addObserverToSchema(groupsExtension.schema, {
    trigger: EXTENSION_TIRGGER_MAINMODAL_SHARE_HANDLER,
    method: async (_, params: MainModalShareEventParams) => {
      modalHandler = params.handle

      return false
    }
  })
}

export const groupsUIExtension: RegovGroupUIExtension = buildUIExtension<RegovGroupExtensionTypes>(groupsExtension,
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
            }] as UIExtensionFactoryProduct<PurposeCredentialCreationParams>[]
        }
      case EXTENSION_ITEM_PURPOSE_ITEM:
        switch (type) {
          case REGOV_CREDENTIAL_TYPE_GROUP:
            return [{
              com: GroupItem(groupsExtension),
              extensionCode: `${groupsExtension.schema.details.code}GroupItem`,
              params: {},
              order: 0
            }] as UIExtensionFactoryProduct<PurposeListItemParams>[]
        }
      case EXTENSION_ITEM_PURPOSE_EVIDENCE:
        switch (type) {
          case REGOV_CREDENTIAL_TYPE_GROUP:
            return [{
              com: EvidenceWidget(groupsExtension),
              extensionCode: `${groupsExtension.schema.details.code}EvidenceWidget`,
              params: {},
              order: 0
            }] as UIExtensionFactoryProduct<PurposeEvidenceWidgetParams>[]
        }
    }
    return [] as UIExtensionFactoryProduct<{}>[]
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

