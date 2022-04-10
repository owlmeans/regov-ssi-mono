import { DIDDocument, KeyPair, Presentation } from "@owlmeans/regov-ssi-core"
import { JWE } from 'did-jwt'


export type CommKey = {
  pk: Uint8Array
  pubKey: Uint8Array
  id: string
}

export type DIDCommHelper = {
  pack: (doc: Presentation, connection: DIDCommConnectMeta) => Promise<JWE>
  unpack?: (jwe: JWE) => Promise<[Presentation, DIDDocument]>
  connect?: (recipient: string, did: DIDDocument) => Promise<DIDCommConnectMeta>
  accept?: (jwt: string) => Promise<DIDCommConnectMeta>
  send?: (message: JWE) => Promise<boolean>
  listen?: (listner: DIDCommListner) => Promise<void>
}

export type DIDCommConnectMeta = {
  didId: string
  recipient?: DIDDocument
}

export type DIDCommListner = {
  init: (didComm: DIDCommHelper) => Promise<void>
  send: (message: JWE) => Promise<boolean>
  close: () => Promise<void>
}

export const ERROR_COMM_NODID = 'ERROR_COMM_NODID'
export const ERROR_COMM_DID_NOKEY = 'ERROR_COMM_DID_NOKEY'