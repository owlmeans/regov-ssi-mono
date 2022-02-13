import { buildUIExtension, EXTENSION_ITEM_PURPOSE_CREATION, UIExtensionFactoryProduct } from "@owlmeans/regov-lib-react"
import { MENU_TAG_CRED_NEW } from "@owlmeans/regov-mold-wallet-web"
import { SignatureCreation } from "./component"
import { signatureExtension } from "./ext"
import { REGOV_CREDENTIAL_TYPE_SIGNATURE } from "./types"

export const signatureWebExtension = buildUIExtension(signatureExtension, (
  purpose, type?
) => {
  console.log(purpose, type)
  switch (purpose) {
    case EXTENSION_ITEM_PURPOSE_CREATION:
      switch (type) {
        case REGOV_CREDENTIAL_TYPE_SIGNATURE:
          return [{
            com: SignatureCreation(signatureExtension),
            extensionCode: `${signatureExtension.schema.details.code}SignatureCreation`,
            params: {},
            order: 0
          }]
      }
  }
  return [] as UIExtensionFactoryProduct<{}>[]
})

signatureWebExtension.menuItems = [
  {
    title: 'menu.new.signature',
    menuTag: MENU_TAG_CRED_NEW,
    ns: signatureExtension.localization?.ns,
    action: {
      path: '',
      params: {
        ext: signatureExtension.schema.details.code,
        type: REGOV_CREDENTIAL_TYPE_SIGNATURE
      }
    }
  }
]