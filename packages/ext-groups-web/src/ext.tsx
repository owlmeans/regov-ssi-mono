import React, { FunctionComponent } from 'react'

import {
  buildUIExtension, ExtensionItemPurpose, EXTENSION_ITEM_PURPOSE_CREATION, EXTENSION_ITEM_PURPOSE_ITEM,
  UIExtensionFactoryProduct, PurposeListItemParams, PurposeCredentialCreationParams, MainModalHandle,
  EXTENSION_TIRGGER_MAINMODAL_SHARE_HANDLER, MainModalShareEventParams, EXTENSION_ITEM_PURPOSE_EVIDENCE,
  PurposeEvidenceWidgetParams,
} from '@owlmeans/regov-lib-react'
import {
  getGroupFromMembershipClaimPresentation, getGroupOwnerIdentity, groupsExtension, RegovGroupExtensionTypes,
  REGOV_CLAIM_TYPE, REGOV_CREDENTIAL_TYPE_GROUP, REGOV_OFFER_TYPE,
} from '@owlmeans/regov-ext-groups'
import { MENU_TAG_CRED_NEW } from '@owlmeans/regov-mold-wallet-web'
import { commonEn } from './i18n'
import {
  GroupCreation, GroupItem, GroupView, EvidenceWidget, MembershipClaimView, MembershipClaimItem,
  MembershipOffer
} from './component'
import {
  addObserverToSchema, EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED, IncommigDocumentEventParams
} from '@owlmeans/regov-ssi-extension'
import {
  Credential, isPresentation, Presentation, REGISTRY_TYPE_IDENTITIES, WalletWrapper
} from '@owlmeans/regov-ssi-core'
import { MembershipClaimOffer } from './component/credential/membership/claim-offer'


if (groupsExtension.localization) {
  groupsExtension.localization.translations['en'] = commonEn
}

if (groupsExtension.schema.events) {
  let modalHandler: MainModalHandle

  groupsExtension.getEvents(EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED)[0].method = async (
    wallet: WalletWrapper, params: IncommigDocumentEventParams
  ) => {
    params.statusHandler.successful = false

    const close = () => {
      params.cleanUp()
      modalHandler.setOpen && modalHandler.setOpen(false)
    }

    if (modalHandler) {
      if (isPresentation(params.credential)) {
        if (params.credential.type.includes(REGOV_CLAIM_TYPE)) {
          let isOwner = false
          const group = getGroupFromMembershipClaimPresentation(params.credential)
          if (group) {
            const registry = wallet.getRegistry(REGISTRY_TYPE_IDENTITIES)
            const owner = getGroupOwnerIdentity(group)
            isOwner = !!registry.getCredential(owner?.id)
          }

          if (isOwner) {
            modalHandler.getContent = () => <MembershipOffer ext={groupsExtension} close={close}
              credential={params.credential as Presentation} />

            params.statusHandler.successful = true
          } else {
            modalHandler.getContent = () => <MembershipClaimView ext={groupsExtension} close={close}
              credential={params.credential as Presentation} />

            params.statusHandler.successful = true
          }
        } else if (params.credential.type.includes(REGOV_OFFER_TYPE)) {
          modalHandler.getContent = () => <MembershipClaimOffer ext={groupsExtension} close={close}
            credential={params.credential as Presentation} />

          params.statusHandler.successful = true
        }
      } else {
        modalHandler.getContent = () => <GroupView ext={groupsExtension} close={close}
          credential={params.credential as Credential} />

        params.statusHandler.successful = true
      }

      if (modalHandler.setOpen && params.statusHandler.successful) {
        modalHandler.setOpen(true)
      }
      /**
       * @TODO Clean up processor on reset
       */

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

export const groupsUIExtension = buildUIExtension(groupsExtension,
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
          case REGOV_CLAIM_TYPE:
            return [{
              com: MembershipClaimItem(groupsExtension) as unknown as FunctionComponent<PurposeListItemParams>,
              extensionCode: `${groupsExtension.schema.details.code}MembershipClaimItem`,
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

