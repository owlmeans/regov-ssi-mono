import { ExtensionDetails, ExtensionItemPurpose } from '@owlmeans/regov-ssi-extension'

import { buildIdentityExtension } from '@owlmeans/regov-ext-identity'

import en from './i18n/en.json'
import { buildUIExtension, UIExtensionFactoryProduct } from '@owlmeans/regov-lib-react'


export const REGOV_IDENTITY_DEFAULT_NAMESPACE = 'regov-ext-basic-identity'

export const buildIdentityExtensionUI = (
  type: string,
  details: ExtensionDetails,
  ns = REGOV_IDENTITY_DEFAULT_NAMESPACE
) => {
  const identityType = type || 'OwlMeans:Regov:Identity'
  // const onboardingFlow = `_Flow:${identityType}:Onboarding`

  type IdentityCredentials = typeof identityType
  // type IdentityFlows = typeof onboardingFlow

  const extension = buildIdentityExtension(type, {
    ...details,
    name: details.name === '' ? 'extension.details.name' : details.name,
  })

  extension.localization = { ns, translations: {} }
  if (ns === REGOV_IDENTITY_DEFAULT_NAMESPACE) {
    extension.localization.translations.en = en
  }

  extension.flowStateMap = {
    ...extension.flowStateMap,
    ['onboarding.welcom']: async (_, params) => {
      console.log('observer called', params.step, params.flow)
    }
  }

  const uiExt = buildUIExtension<IdentityCredentials>(
    extension,
    (__: ExtensionItemPurpose, _?: IdentityCredentials) => {

      return [] as UIExtensionFactoryProduct<{}>[]
    }
  )

  return uiExt
}