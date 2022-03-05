export * from './types'
import React from 'react'
import {ExtensionDetails, EXTENSION_TRIGGER_AUTHENTICATED } from '@owlmeans/regov-ssi-extension'
import { BASIC_IDENTITY_TYPE, BuildExtensionParams, buildIdentityExtension } from '@owlmeans/regov-ext-identity'
import en from './i18n/en.json'
import { 
  buildUIExtension, UIExtensionFactoryProduct, MainModalAuthenticatedEventParams, ExtensionItemPurpose,
  EXTENSION_ITEM_PURPOSE_DASHBOARD_WIDGET, EXTENSION_ITEM_PURPOSE_EVIDENCE, EXTENSION_ITEM_PURPOSE_VALIDATION,
} from '@owlmeans/regov-lib-react'
import { DashboardWidget, EvidenceWidget, Onboarding, ValidationWidget } from './component'
import { REGOV_IDENTITY_DEFAULT_NAMESPACE } from './types'
import { REGISTRY_TYPE_IDENTITIES, Credential, CredentialSubject, WalletWrapper } from '@owlmeans/regov-ssi-core'


export const REGOV_IDENTITY_DEFAULT_TYPE = 'OwlMeans:Regov:Identity'

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
  })

  extension.localization = { ns, translations: {} }
  if (ns === REGOV_IDENTITY_DEFAULT_NAMESPACE) {
    extension.localization.translations.en = en
  }

  if (extension.schema.events) {
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