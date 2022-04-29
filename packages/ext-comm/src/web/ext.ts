import { EVENT_INIT_CONNECTION, InitCommEventParams } from "@owlmeans/regov-comm"
import { buildUIExtension } from "@owlmeans/regov-lib-react"
import { buildCommExtension } from "../ext"
import { CommExtConfig } from "../types"


export const buildCommUIExtension = (config: CommExtConfig) => {
  const commExtension = buildCommExtension(config)

  const initEvent = commExtension.getEvent(EVENT_INIT_CONNECTION)
  if (initEvent) {
    const initMethod = initEvent.method
    if (initMethod) {
      initEvent.method = async (wallet, params: InitCommEventParams) => {
        await initMethod(wallet, params)
        const helper = commExtension.didComm && commExtension.didComm[wallet.store.alias]
        if (helper) {
          params.statusHandle.defaultListener = {
            accept: async (conn) => {
              await helper.accept(conn)
            },
            receive: async (conn, cred) => {
              params.trigger && await params.trigger(conn, cred)
            }
          }
          await helper.addListener(params.statusHandle.defaultListener)
        }
      }
    }
  }

  return buildUIExtension(commExtension, (_) => {
    return []
  })
}