import { DIDDocument, EventParams, Presentation } from "@owlmeans/regov-ssi-core"


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
  trigger: (conn: Object, doc: Credential | Presentation) => Promise<void>
  resolveConnection: () => Promise<void>
  rejectConnection: (err: any) => Promise<void>
  registerDidHandle: RegisterDIDHandle
}

export type RegisterDIDHandle = {
  registerDid?: (dids: string[]) => Promise<boolean[]>
}