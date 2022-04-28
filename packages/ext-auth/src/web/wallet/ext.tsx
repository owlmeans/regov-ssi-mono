import React from "react"
import { buildUIExtension, castMainModalHandler, MainModalAuthenticatedEventParams } from "@owlmeans/regov-lib-react"
import { addObserverToSchema, EXTENSION_TRIGGER_AUTHENTICATED, isPresentation } from "@owlmeans/regov-ssi-core"
import { authExtension } from "../../ext"
import { EVENT_INIT_CONNECTION, InitCommEventParams, RegisterDIDHandle } from "../types"
import { DIDAuthResponse } from './component'
import { REGOV_AUTH_REQUEST_TYPE } from "../../types"


const modalHandler = castMainModalHandler(authExtension)

authExtension.schema = addObserverToSchema(authExtension.schema, {
  trigger: EXTENSION_TRIGGER_AUTHENTICATED,
  method: async (wallet, params: MainModalAuthenticatedEventParams) => {
    const registerDidHandle: RegisterDIDHandle = {}
    params.extensions.triggerEvent<InitCommEventParams>(wallet, EVENT_INIT_CONNECTION, {
      // alias?: string
      // statusHandle: { established: boolean }
      // trigger: (conn: Object, doc: Credential | Presentation) => Promise<void>
      // resolveConnection: () => Promise<void>
      // rejectConnection: (err: any) => Promise<void>
      // registerDidHandle: RegisterDIDHandle
      statusHandle: { established: false },
      trigger: async (_, doc) => {
        if (!modalHandler.handle) {
          return
        }
        if (isPresentation(doc)) {
          if (doc.type.includes(REGOV_AUTH_REQUEST_TYPE)) {
            modalHandler.handle.getContent = () => <DIDAuthResponse request={doc} />
          }
        }
      },
      resolveConnection: async () => { },
      rejectConnection: async (err) => {
        console.error(err)
      },
      registerDidHandle
    })
  }
})

export const authUIExtension = buildUIExtension(authExtension, (_) => {
  return []
})