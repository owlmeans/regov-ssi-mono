import { DIDCommConnectMeta, DIDCommHelper, WSClientConfig } from "@owlmeans/regov-comm"
import { Credential, DIDDocument, EventParams, Extension, Presentation } from "@owlmeans/regov-ssi-core"


export const REGOV_EXT_COMM_NAMESPACE = 'owlmeans-regov-ext-comm'

export const EVENT_SEND_REQUEST = 'regov:ext:comm:send:request'

export type SendRequestEventParams = EventParams & {
  alias?: string
  recipient: string
  sender?: DIDDocument
  cred: Presentation
  statusHandle: { sent: boolean }
  resolveSending: () => Promise<void>
  rejectSending: (err: any) => Promise<void>
  resolveResponse: (doc: Presentation) => Promise<void>
}

export const EVENT_INIT_CONNECTION = 'regov:ext:comm:init'

export type InitCommEventParams = EventParams & {
  alias?: string
  statusHandle: { established: boolean }
  trigger: (conn: DIDCommConnectMeta, doc: Credential | Presentation) => Promise<void>
  resolveConnection: () => Promise<void>
  rejectConnection: (err: any) => Promise<void>
  registerDidHandle: {
    registerDid?: (dids: string[]) => Promise<boolean[]>
  }
}

export type CommExtConfig = {
  wsConfig: { [alias: string]: WSClientConfig }
}

export type CommExtension = Extension & {
  didComm?: { [alias: string]: DIDCommHelper }
}

export const DEFAULT_SERVER_ALIAS = 'default'