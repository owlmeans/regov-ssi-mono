import React from "react"
import { buildUIExtension, castMainModalHandler, MainModalAuthenticatedEventParams } from "@owlmeans/regov-lib-react"
import { addObserverToSchema, EXTENSION_TRIGGER_AUTHENTICATED, isPresentation } from "@owlmeans/regov-ssi-core"
import { authExtension } from "../../ext"
import { DIDAuthResponse } from './component'
import { REGOV_AUTH_REQUEST_TYPE } from "../../types"
import { EVENT_INIT_CONNECTION, InitCommEventParams } from "@owlmeans/regov-comm"


const modalHandler = castMainModalHandler(authExtension)

authExtension.schema = addObserverToSchema(authExtension.schema, {
  trigger: EXTENSION_TRIGGER_AUTHENTICATED,
  method: async (wallet, params: MainModalAuthenticatedEventParams) => {
    const statusHandle = {
      established: false,
    }
    params.extensions.triggerEvent<InitCommEventParams>(wallet, EVENT_INIT_CONNECTION, {
      statusHandle,
      trigger: async (conn, doc) => {
        if (!modalHandler.handle) {
          return
        }
        const close = () => {
          modalHandler?.handle?.setOpen && modalHandler.handle.setOpen(false)
        }

        if (isPresentation(doc)) {
          if (doc.type.includes(REGOV_AUTH_REQUEST_TYPE)) {
            modalHandler.handle.getContent = () =>
              <DIDAuthResponse request={doc} conn={conn} connection={statusHandle} close={close} />

            if (modalHandler.handle.setOpen) {
              modalHandler.handle.setOpen(true)
            }
          }
        }
      },
      resolveConnection: async (_) => { },
      rejectConnection: async (err) => {
        console.error(err)
      }
    })
  }
})

export const authUIExtension = buildUIExtension(authExtension, (_) => {
  return []
})