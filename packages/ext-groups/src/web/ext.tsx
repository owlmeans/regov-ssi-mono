/**
 *  Copyright 2023 OwlMeans
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

import { FunctionComponent } from 'react'

import {
  buildUIExtension, ExtensionItemPurpose, EXTENSION_ITEM_PURPOSE_CREATION, EXTENSION_ITEM_PURPOSE_ITEM,
  UIExtensionFactoryProduct, PurposeListItemParams, PurposeCredentialCreationParams, MainModalHandle,
  EXTENSION_TIRGGER_MAINMODAL_SHARE_HANDLER, MainModalShareEventParams, EXTENSION_ITEM_PURPOSE_EVIDENCE,
  PurposeEvidenceWidgetParams, EXTENSION_ITEM_PURPOSE_VALIDATION, MainModalAuthenticatedEventParams,
} from '@owlmeans/regov-lib-react'
import {
  RegovGroupExtensionTypes, REGOV_MEMBERSHIP_CLAIM_TYPE, REGOV_CREDENTIAL_TYPE_GROUP, REGOV_CREDENTIAL_TYPE_MEMBERSHIP,
  REGOV_MEMBERSHIP_OFFER_TYPE, REGOV_GROUP_CLAIM_TYPE
} from '../types'
import { groupsExtension } from '../ext'
import { getGroupFromMembershipClaimPresentation, getGroupOwnerIdentity } from '../util'
import { MENU_TAG_CRED_NEW } from '@owlmeans/regov-lib-react'
import {
  GroupCreation, GroupItem, GroupView, EvidenceWidget, MembershipClaimView, MembershipClaimItem,
  MembershipOffer, MembershipValidationWidget, MembershipEvidenceWidget, GroupValidationWidget,
  MembershipItem
} from './component'
import {
  addObserverToSchema, EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED, EXTENSION_TRIGGER_AUTHENTICATED,
} from '@owlmeans/regov-ssi-core'
import {
  Credential, isPresentation, Presentation, REGISTRY_TYPE_IDENTITIES, WalletWrapper
} from '@owlmeans/regov-ssi-core'
import { MembershipClaimOffer } from './component/credential/membership/claim-offer'
import { EVENT_INIT_CONNECTION, InitCommEventParams, IncommigDocumentWithConn } from '@owlmeans/regov-comm'
import { GroupClaimView } from './component/credential/group/claim-view'
import { GroupClaimItem } from './component/credential/group/claim-item'


if (groupsExtension.schema.events) {
  let modalHandler: MainModalHandle

  groupsExtension.modifyEvent(EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED, 'method', async (
    wallet: WalletWrapper, params: IncommigDocumentWithConn
  ) => {
    params.statusHandler.successful = false

    const close = () => {
      params.cleanUp()
      modalHandler.setOpen && modalHandler.setOpen(false)
    }

    if (modalHandler) {
      if (isPresentation(params.credential)) {
        if (params.credential.type.includes(REGOV_GROUP_CLAIM_TYPE)) {
          modalHandler.getContent = () =>
            <GroupClaimView close={close} credential={params.credential as Presentation}
              ext={groupsExtension} conn={params.conn} />

          params.statusHandler.successful = true
        } else if (params.credential.type.includes(REGOV_MEMBERSHIP_CLAIM_TYPE)) {
          let isOwner = false
          const group = getGroupFromMembershipClaimPresentation(params.credential)
          if (group) {
            const registry = wallet.getRegistry(REGISTRY_TYPE_IDENTITIES)
            const owner = getGroupOwnerIdentity(group)
            isOwner = !!registry.getCredential(owner?.id)

            if (isOwner) {
              modalHandler.getContent = () => <MembershipOffer ext={groupsExtension} close={close}
                credential={params.credential as Presentation} />

              params.statusHandler.successful = true
            } else {
              modalHandler.getContent = () => <MembershipClaimView ext={groupsExtension} close={close}
                credential={params.credential as Presentation} />

              params.statusHandler.successful = true
            }
          } else {
            modalHandler.getContent = () =>
              <MembershipOffer close={close} credential={params.credential as Presentation}
                ext={groupsExtension} conn={params.conn} />

            params.statusHandler.successful = true
          }
        } else if (params.credential.type.includes(REGOV_MEMBERSHIP_OFFER_TYPE)) {
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
  })

  groupsExtension.schema = addObserverToSchema(groupsExtension.schema, {
    trigger: EXTENSION_TIRGGER_MAINMODAL_SHARE_HANDLER,
    method: async (_, params: MainModalShareEventParams) => {
      modalHandler = params.handle

      return false
    }
  })

  groupsExtension.schema = addObserverToSchema(groupsExtension.schema, {
    trigger: EXTENSION_TRIGGER_AUTHENTICATED,
    method: async (wallet, params: MainModalAuthenticatedEventParams) => {
      const statusHandle = {
        established: false,
      }
      params.extensions.triggerEvent<InitCommEventParams>(wallet, EVENT_INIT_CONNECTION, {
        statusHandle,
        trigger: async (conn, doc) => {
          if (!modalHandler) {
            return
          }
          const close = () => {
            modalHandler?.setOpen && modalHandler.setOpen(false)
          }

          if (isPresentation(doc)) {
            if (doc.type.includes(REGOV_GROUP_CLAIM_TYPE)) {
              console.log('INCOMING GROUP CLAIM', doc)
              modalHandler.getContent = () =>
                <GroupClaimView close={close} credential={doc} ext={groupsExtension} conn={conn}
                  connection={statusHandle} />

              modalHandler.setOpen && modalHandler.setOpen(true)
            } else if (doc.type.includes(REGOV_MEMBERSHIP_CLAIM_TYPE)) {
              console.log('INCOMING MEMBERSHIP CLAIM', doc)

              modalHandler.getContent = () =>
                <MembershipOffer close={close} credential={doc} ext={groupsExtension} conn={conn}
                  connection={statusHandle} />

              modalHandler.setOpen && modalHandler.setOpen(true)
            }
          }
        },
        rejectConnection: async (err) => {
          console.error(err)
        }
      })
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
          case REGOV_MEMBERSHIP_CLAIM_TYPE:
            return [{
              com: MembershipClaimItem(groupsExtension) as unknown as FunctionComponent<PurposeListItemParams>,
              extensionCode: `${groupsExtension.schema.details.code}MembershipClaimItem`,
              params: {},
              order: 0
            }] as UIExtensionFactoryProduct<PurposeListItemParams>[]
          case REGOV_CREDENTIAL_TYPE_MEMBERSHIP:
            return [{
              com: MembershipItem(groupsExtension) as unknown as FunctionComponent<PurposeListItemParams>,
              extensionCode: `${groupsExtension.schema.details.code}MembershipItem`,
              params: {},
              order: 0
            }] as UIExtensionFactoryProduct<PurposeListItemParams>[]
          case REGOV_GROUP_CLAIM_TYPE:
            return [{
              com: GroupClaimItem(groupsExtension) as unknown as FunctionComponent<PurposeListItemParams>,
              extensionCode: `${groupsExtension.schema.details.code}GroupClaimItem`,
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
          case REGOV_CREDENTIAL_TYPE_MEMBERSHIP:
            return [{
              com: MembershipEvidenceWidget(groupsExtension),
              extensionCode: `${groupsExtension.schema.details.code}MembershipEvidenceWidget`,
              params: {},
              order: 0
            }] as UIExtensionFactoryProduct<PurposeEvidenceWidgetParams>[]
        }
      case EXTENSION_ITEM_PURPOSE_VALIDATION:
        switch (type) {
          case REGOV_CREDENTIAL_TYPE_GROUP:
            return [{
              com: GroupValidationWidget(groupsExtension),
              extensionCode: `${groupsExtension.schema.details.code}GroupValidationWidget`,
              params: {},
              order: 0
            }]
          case REGOV_CREDENTIAL_TYPE_MEMBERSHIP:
            return [{
              com: MembershipValidationWidget(groupsExtension),
              extensionCode: `${groupsExtension.schema.details.code}MembershipValidationWidget`,
              params: {},
              order: 0
            }]
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

