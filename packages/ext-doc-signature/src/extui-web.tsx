import {
  buildUIExtension, EXTENSION_ITEM_PURPOSE_CREATION, EXTENSION_ITEM_PURPOSE_DASHBOARD_WIDGET,
  EXTENSION_ITEM_PURPOSE_ITEM, PurposeListItemParams, UIExtensionFactoryProduct
} from "@owlmeans/regov-lib-react"
import { MENU_TAG_CRED_NEW } from "@owlmeans/regov-mold-wallet-web"
import { SignatureCreationWeb, SignatureItemWeb } from "./component"
import { DashboardWidgetWeb } from "./component/web/dashboard-widget"
import { signatureExtension } from "./ext"
import { REGOV_CREDENTIAL_TYPE_SIGNATURE } from "./types"


export const signatureWebExtension = buildUIExtension(signatureExtension, (purpose, type?) => {
  switch (purpose) {
    case EXTENSION_ITEM_PURPOSE_CREATION:
      switch (type) {
        case REGOV_CREDENTIAL_TYPE_SIGNATURE:
          return [{
            com: SignatureCreationWeb(signatureExtension),
            extensionCode: `${signatureExtension.schema.details.code}SignatureCreation`,
            params: {},
            order: 0
          }]
      }
    case EXTENSION_ITEM_PURPOSE_ITEM:
      switch (type) {
        case REGOV_CREDENTIAL_TYPE_SIGNATURE:
          return [{
            com: SignatureItemWeb(signatureExtension),
            extensionCode: `${signatureExtension.schema.details.code}GroupItem`,
            params: {},
            order: 0
          }] as UIExtensionFactoryProduct<PurposeListItemParams>[]
      }
    case EXTENSION_ITEM_PURPOSE_DASHBOARD_WIDGET:
      return [{
        com: DashboardWidgetWeb(signatureExtension),
        extensionCode: `${signatureExtension.schema.details.code}DashboardWidget`,
        params: {},
        order: 0
      }]
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