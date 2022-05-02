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
  addObserverToSchema, ExtensionDetails, EXTENSION_TRIGGER_AUTHENTICATED,
  EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED, IncommigDocumentEventParams, isCredential
} from '@owlmeans/regov-ssi-core'
import { BASIC_IDENTITY_TYPE, BuildExtensionParams, buildIdentityExtension } from '../ext'
import {
  buildUIExtension, UIExtensionFactoryProduct, MainModalAuthenticatedEventParams,
  ExtensionItemPurpose, EXTENSION_ITEM_PURPOSE_DASHBOARD_WIDGET,
  EXTENSION_ITEM_PURPOSE_EVIDENCE, EXTENSION_ITEM_PURPOSE_VALIDATION, MainModalHandle,
  EXTENSION_TIRGGER_MAINMODAL_SHARE_HANDLER, MainModalShareEventParams,
  EXTENSION_ITEM_PURPOSE_ITEM
} from '@owlmeans/regov-lib-react'
import { DashboardWidget, EvidenceWidget, Onboarding, ValidationWidget } from './component'
import {
  REGISTRY_TYPE_IDENTITIES, Credential, CredentialSubject, WalletWrapper
} from '@owlmeans/regov-ssi-core'
import { IdentityView } from './component/identity/view'
import { IdentityItem } from './component/identity/item'
import { REGOV_IDENTITY_DEFAULT_NAMESPACE, REGOV_IDENTITY_DEFAULT_TYPE } from '../types'


export const buildIdentityExtensionUI = (
  type: string,
  params: BuildExtensionParams,
  details: ExtensionDetails,
  ns = REGOV_IDENTITY_DEFAULT_NAMESPACE
) => {
  const identityType = type || REGOV_IDENTITY_DEFAULT_TYPE
  type IdentityCredentials = typeof identityType

  const extension = buildIdentityExtension(type, params, {
    ...details,
    name: details.name === '' ? 'extension.details.name' : details.name,
  }, ns)

  if (extension.schema.events) {
    let modalHandler: MainModalHandle

    extension.schema = addObserverToSchema(extension.schema, {
      trigger: EXTENSION_TIRGGER_MAINMODAL_SHARE_HANDLER,
      method: async (_, params: MainModalShareEventParams) => {
        modalHandler = params.handle

        return false
      }
    })

    extension.getEvents(EXTENSION_TRIGGER_AUTHENTICATED)[0].method = async (
      wallet: WalletWrapper, params: MainModalAuthenticatedEventParams
    ) => {
      if (params.config.development && extension.schema.details.defaultCredType) {
        const factory = extension.getFactory(extension.schema.details.defaultCredType)
        const unsigned = await factory.build(wallet, { subjectData: {} })
        const identity = await factory.sign(wallet, { unsigned })

        const registry = wallet.getRegistry(REGISTRY_TYPE_IDENTITIES)
        const item = await registry.addCredential<CredentialSubject, Credential<CredentialSubject>>(
          identity as Credential<CredentialSubject>
        )
        item.meta.title = 'Main ID'
        registry.registry.rootCredential = identity.id

        if (params.handler) {
          params.handler.notify()
        }

        console.info('DEV: Identity initiated.')

        return false
      }

      params.handle.getContent = () => <Onboarding {...params} ns={ns} ext={extension} />

      if (params.handle.setOpen) {
        params.handle.setOpen(true)

        return true
      }

      return false
    }

    extension.modifyEvent(EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED, 'method', async (
      _, params: IncommigDocumentEventParams
    ) => {
      params.statusHandler.successful = false

      const close = () => {
        params.cleanUp()
        modalHandler.setOpen && modalHandler.setOpen(false)
      }

      if (modalHandler) {
        if (isCredential(params.credential)) {
          modalHandler.getContent = () => <IdentityView ext={extension} close={close}
            credential={params.credential as Credential} />

          params.statusHandler.successful = true
        }

        if (params.statusHandler.successful && modalHandler.setOpen) {
          modalHandler.setOpen(true)

          return true
        }
      }

      return false
    })
  }

  const uiExt = buildUIExtension(
    extension,
    (purpose: ExtensionItemPurpose, type?: IdentityCredentials) => {
      switch (purpose) {
        case EXTENSION_ITEM_PURPOSE_DASHBOARD_WIDGET:
          return [
            {
              com: DashboardWidget(extension),
              extensionCode: `${details.code}DashboardWidget`,
              params: {},
              order: 0
            }
          ] as UIExtensionFactoryProduct[]
        case EXTENSION_ITEM_PURPOSE_ITEM:
          return [{
            com: IdentityItem(extension),
            extensionCode: `${details.code}IdentityItem`,
            params: {},
            order: 0
          }] as UIExtensionFactoryProduct[]
        case EXTENSION_ITEM_PURPOSE_EVIDENCE:
          return [
            {
              com: EvidenceWidget(extension),
              extensionCode: `${details.code}EvidenceWidget`,
              params: {},
              order: 0
            }
          ]
        case EXTENSION_ITEM_PURPOSE_VALIDATION:
          switch (type) {
            case identityType:
            case BASIC_IDENTITY_TYPE:
              return [{
                com: ValidationWidget(extension),
                extensionCode: `${details.code}ValidationWidget`,
                params: {},
                order: 0
              }]
          }
      }

      return [] as UIExtensionFactoryProduct<{}>[]
    }
  )

  return uiExt
}