import { DIDDocument, Presentation } from "@owlmeans/regov-ssi-core"
import { JWE } from 'did-jwt'


export type CommKey = {
  pk: Uint8Array
  pubKey: Uint8Array
  id: string
}

export type DIDCommHelper = {
  pack: (doc: Presentation, connection: DIDCommConnectMeta) => Promise<JWE>
  unpack?: (jwe: JWE) => Promise<[Presentation, DIDDocument]>
  /**
   * Open connection with a did.
   * You should use only didId to open connection.
   */
  connect: (options?: DIDCommConnectMeta, recipient?: string, did?: DIDDocument) => Promise<DIDCommConnectMeta>
  /**
   * Accept connection and provide more info for connection.
   * Send did document to provide public key for sender.
   */
  accept?: (jwt: string) => Promise<DIDCommConnectMeta>
  /**
   * Update opened connection with acceptance response.
   * Receive recipient public key and update connection data with it.
   */
  establish?: (connection: DIDCommConnectMeta) => Promise<DIDCommConnectMeta>
  send?: (message: JWE) => Promise<boolean>
  addChannel: (channel: DIDCommChannel, def?: boolean) => Promise<void>
  unregister: (channel: DIDCommChannel) => Promise<void>
  listen?: (listner: DIDCommListner) => Promise<void>
  receive: (datagram: string) => Promise<void>
}

export type DIDCommConnectMeta = {
  recipientId: string
  sender: DIDDocument
  recipient?: DIDDocument
  channel?: string
}

export type DIDCommListner = {
  accept?: (connection: DIDCommConnectMeta) => Promise<void>
  receive?: (connection: DIDCommConnectMeta, doc: Presentation) => Promise<void>
}

export type DIDCommChannel = {
  code: string

  init: (didComm: DIDCommHelper) => Promise<void>
  send: (message: string) => Promise<boolean>
  close: () => Promise<void>
}

export const ERROR_COMM_NODID = 'ERROR_COMM_NODID'
export const ERROR_COMM_DID_NOKEY = 'ERROR_COMM_DID_NOKEY'
export const ERROR_COMM_NO_RECIPIENT = 'ERROR_COMM_NO_RECIPIENT'
export const ERROR_COMM_NO_SENDER = 'ERROR_COMM_NO_SENDER'
export const ERROR_COMM_SEND_FAILED = 'ERROR_COMM_SEND_FAILED'

export const COMM_CHANNEL_DEFAULT = '_default'
export const COMM_CHANNEL_BROADCAST = '__broadcast'