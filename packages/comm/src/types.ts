import { Credential, DIDDocument, Presentation } from "@owlmeans/regov-ssi-core"
import { JWE } from 'did-jwt'


export type CommKey = {
  pk: Uint8Array
  pubKey: Uint8Array
  id: string
}

export type DIDCommHelper = {
  pack: (doc: Presentation | Credential, connection: DIDCommConnectMeta) => Promise<JWE>
  unpack?: (jwe: JWE) => Promise<[Presentation | Credential, DIDDocument]>
  /**
   * Open connection with a did.
   * You should use only didId to open connection.
   */
  connect: (options: DIDCommConnectMeta, recipient?: string, did?: DIDDocument) => Promise<DIDCommConnectMeta>
  /**
   * Accept connection and provide more info for connection.
   * Send did document to provide public key for sender.
   */
  accept: (options: DIDCommConnectMeta) => Promise<DIDCommConnectMeta>
  send: (doc: Presentation | Credential, connection: DIDCommConnectMeta) => Promise<boolean>
  addChannel: (channel: DIDCommChannel, def?: boolean) => Promise<void>
  unregister: (channel: DIDCommChannel) => Promise<void>
  addListener: (listner: DIDCommListner) => Promise<void>
  receive: (datagram: string, channel: DIDCommChannel) => Promise<void>
}

export type DIDCommConnectMeta = {
  recipientId: string
  sender: DIDDocument
  recipient?: DIDDocument
  channel?: string
}

export type DIDCommConnectMetaKeys = keyof DIDCommConnectMeta

export const connectionFieldList: DIDCommConnectMetaKeys[] = [
  'recipientId', 'sender', 'recipient', 'channel'
]

export type DIDCommListner = {
  init: (didComm: DIDCommHelper) => Promise<void>
  accept: (connection: DIDCommConnectMeta) => Promise<void>
  established: (connection: DIDCommConnectMeta) => Promise<void>
  receive: (connection: DIDCommConnectMeta, doc: Presentation | Credential) => Promise<void>
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
export const ERROR_COMM_DID_WRONG_SIGNATURE = 'ERROR_COMM_DID_WRONG_SIGNATURE'
export const ERROR_COMM_NO_CHANNEL = 'ERROR_COMM_NO_CHANNEL'
export const ERROR_COMM_NO_CONNECTION = 'ERROR_COMM_NO_CONNECTION'
export const ERROR_COMM_INVALID_PAYLOAD = 'ERROR_COMM_INVALID_PAYLOAD'
export const ERROR_COMM_MALFORMED_PAYLOAD = 'ERROR_COMM_MALFORMED_PAYLOAD'
export const ERROR_COMM_ALIAN_SENDER = 'ERROR_COMM_ALIAN_SENDER'

export const COMM_CHANNEL_DEFAULT = '_default'
export const COMM_CHANNEL_BROADCAST = '__broadcast'

export const COMM_DID_AGREEMENT_KEY_DEFAULT = 'comm'

export const COMM_VERIFICATION_TYPE = 'X25519KeyAgreementKey2020'