import { ExtensionDetails } from '@owlmeans/regov-ssi-extension'

import { buildIdentityExtension } from '@owlmeans/regov-ext-identity'


export const buildIdentityExtensionUI = (
  type: string,
  ns: string,
  details: ExtensionDetails
) => {
  const extension = buildIdentityExtension(type, {
    ...details,
    name: 'extension.details.name',
  })

  extension.localization = {
    ns, translations: {}
  }

  return extension
}