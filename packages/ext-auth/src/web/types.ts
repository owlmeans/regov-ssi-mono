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