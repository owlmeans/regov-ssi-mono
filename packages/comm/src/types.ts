/**
 *  Copyright 2022 OwlMeans
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import {
  Credential, DIDDocument, EventParams, IncommigDocumentEventParams, Presentation, WalletWrapper
} from '@owlmeans/regov-ssi-core'
import { JWE } from 'did-jwt'


export type CommKey = {
  pk: Uint8Array
  pubKey: Uint8Array
  id: string
}

export type DIDCommHelper = {
  cleanup: () => Promise<void>
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
  removeListener: (listner: DIDCommListner) => void
  receive: (datagram: string, channel: DIDCommChannel) => Promise<void>
  listen: (did: WalletWrapper | string) => Promise<boolean>
}

export type DIDCommConnectMeta = {
  recipientId: string
  sender: DIDDocument
  recipient?: DIDDocument
  channel?: string
  allowAsync?: boolean
}

export type IncommigDocumentWithConn = IncommigDocumentEventParams & {
  conn?: DIDCommConnectMeta
}

export type DIDCommConnectMetaKeys = keyof DIDCommConnectMeta

export const connectionFieldList: DIDCommConnectMetaKeys[] = [
  'recipientId', 'sender', 'recipient', 'channel'
]

export type DIDCommListner = {
  init?: (didComm: DIDCommHelper) => Promise<void>
  accept?: (connection: DIDCommConnectMeta) => Promise<void>
  established?: (connection: DIDCommConnectMeta) => Promise<void>
  receive?: (connection: DIDCommConnectMeta, doc: Presentation | Credential) => Promise<void>
}

export type DIDCommChannel = {
  code: string

  init: (didComm: DIDCommHelper) => Promise<void>
  send: (message: string, params?: { ok?: boolean, id?: string }) => Promise<boolean>
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
export const COMM_WS_SUBPROTOCOL = 'owlmeans-regov-ws-did-com'

export const COMM_WS_PREFIX_CONFIRMED = 'ok'
export const COMM_WS_PREFIX_DIDDOC = 'diddoc'
export const COMM_WS_PREFIX_ERROR = 'error'

export const ERROR_COMM_WS_DID_REGISTERED = 'ERROR_COMM_WS_DID_REGISTERED'
export const ERROR_COMM_WS_UNKNOWN = 'ERROR_COMM_WS_UNKNOWN'
export const ERROR_COMM_WS_TIMEOUT = 'ERROR_COMM_WS_TIMEOUT'
export const ERROR_COMM_CANT_SEND = 'ERROR_COMM_CANT_SEND'

export const COMM_DID_AGREEMENT_KEY_DEFAULT = 'comm'

export const COMM_VERIFICATION_TYPE = 'X25519KeyAgreementKey2020'


export const EVENT_INIT_CONNECTION = 'regov:comm:init'

export type InitCommEventParams = EventParams & {
  alias?: string
  statusHandle: CommConnectionStatusHandler
  trigger?: (conn: DIDCommConnectMeta, doc: Credential | Presentation) => Promise<void>
  resolveConnection?: (helper: DIDCommHelper) => Promise<void>
  rejectConnection?: (err: any) => Promise<void>
}

export type CommConnectionStatusHandler = {
  established: boolean
  helper?: DIDCommHelper
  defaultListener?: DIDCommListner
}

export const ERROR_COMM_CONNECTION_UNKNOWN = 'ERROR_COMM_CONNECTION_UNKNOWN'

