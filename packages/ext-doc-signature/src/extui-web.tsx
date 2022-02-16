import {
  buildUIExtension, EXTENSION_ITEM_PURPOSE_CREATION, EXTENSION_ITEM_PURPOSE_DASHBOARD_WIDGET,
  EXTENSION_ITEM_PURPOSE_ITEM, EXTENSION_TIRGGER_MAINMODAL_SHARE_HANDLER, MainModalHandle,
  MainModalShareEventParams, PurposeListItemParams, UIExtensionFactoryProduct
} from "@owlmeans/regov-lib-react"
import { MENU_TAG_CRED_NEW, MENU_TAG_REQUEST_NEW } from "@owlmeans/regov-mold-wallet-web"
import { WalletWrapper, Credential } from "@owlmeans/regov-ssi-core"
import {
  addObserverToSchema, EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED, IncommigDocumentEventParams
} from "@owlmeans/regov-ssi-extension"
import React from "react"
import { SignatureCreationWeb, SignatureItemWeb, SignatureView } from "./component"
import { DashboardWidgetWeb } from "./component/web/dashboard-widget"
import { signatureExtension } from "./ext"
import { REGOV_CREDENTIAL_TYPE_SIGNATURE } from "./types"


if (signatureExtension.schema.events) {
  let modalHandler: MainModalHandle

  signatureExtension.schema = addObserverToSchema(signatureExtension.schema, {
    trigger: EXTENSION_TIRGGER_MAINMODAL_SHARE_HANDLER,
    method: async (_, params: MainModalShareEventParams) => {
      modalHandler = params.handle

      return false
    }
  })

  signatureExtension.getEvents(EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED)[0].method = async (
    _: WalletWrapper, params: IncommigDocumentEventParams
  ) => {
    params.statusHandler.successful = false

    const close = () => {
      params.cleanUp()
      modalHandler.setOpen && modalHandler.setOpen(false)
    }

    if (modalHandler) {
      modalHandler.getContent = () => <SignatureView ext={signatureExtension} close={close}
        credential={params.credential as Credential} />

      params.statusHandler.successful = true

      if (modalHandler.setOpen && params.statusHandler.successful) {
        modalHandler.setOpen(true)
      }

      return true
    }

    return false
  }
}

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
  },
  {
    title: 'menu.request.signature',
    menuTag: MENU_TAG_REQUEST_NEW,
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