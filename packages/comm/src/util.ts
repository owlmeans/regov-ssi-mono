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

import { generateKeyPairFromSeed } from '@stablelib/x25519'
import {
  CryptoKey, DIDDocument, DIDHelper, DIDPURPOSE_AGREEMENT, ExtensionRegistry, KEYCHAIN_ERROR_NO_KEY,
  KeyPairToCryptoKeyOptions, Credential, Presentation, WalletWrapper, ERROR_NO_IDENTITY
} from "@owlmeans/regov-ssi-core"
import {
  CommKey, COMM_DID_AGREEMENT_KEY_DEFAULT, connectionFieldList, DIDCommConnectMeta,
  DIDCommHelper, DIDCommListner, ERROR_COMM_CANT_SEND, ERROR_COMM_DID_NOKEY, ERROR_COMM_NO_RECIPIENT,
  ERROR_COMM_WS_UNKNOWN, EVENT_INIT_CONNECTION, InitCommEventParams
} from "./types"
import { JWE } from 'did-jwt'


export const cryptoKeyToCommKey = async (
  key: CryptoKey, options?: KeyPairToCryptoKeyOptions
): Promise<CommKey> => {
  if (!key.pk) {
    throw Error(KEYCHAIN_ERROR_NO_KEY)
  }
  const pk = Buffer.from(key.pk, 'utf8').subarray(0, 32)
  const pubKey = generateKeyPairFromSeed(pk).publicKey

  return {
    id: options?.id || key.id || '_noid_',
    pk, pubKey
  }
}

export const filterConnectionFields = (connection: DIDCommConnectMeta): DIDCommConnectMeta => {
  return Object.fromEntries(
    connectionFieldList.map(field => [field, connection[field]])
  ) as unknown as DIDCommConnectMeta
}

export const invertConnection = (connection: DIDCommConnectMeta, channel?: string): DIDCommConnectMeta => {
  const newConnection = filterConnectionFields(JSON.parse(JSON.stringify(connection)))

  if (!newConnection.recipient) {
    throw new Error(ERROR_COMM_NO_RECIPIENT)
  }

  return {
    ...newConnection,
    recipientId: newConnection.sender.id,
    recipient: newConnection.sender,
    sender: newConnection.recipient,
    channel: channel || newConnection.channel
  }
}

export const parseJWE = (data: string) => {
  try {
    return JSON.parse(data) as JWE
  } catch (e) {
  }

  return undefined
}

export const didDocToCommKeyBuilder = (helper: DIDHelper) =>
  async (did: DIDDocument, keyId: string = COMM_DID_AGREEMENT_KEY_DEFAULT): Promise<Partial<CommKey>> => {
    const agreement = helper.expandVerificationMethod(did, DIDPURPOSE_AGREEMENT, keyId)
    if (!agreement.publicKeyBase58) {
      throw new Error(ERROR_COMM_DID_NOKEY)
    }

    return {
      id: did.id,
      pubKey: helper.getCrypto().base58().decode(agreement.publicKeyBase58)
    }
  }

export const getDIDCommUtils = (wallet: WalletWrapper) => {
  return {
    send: async (
      conn: DIDCommConnectMeta, doc?: Credential | Presentation,
      listener?: (helper: DIDCommHelper) => DIDCommListner
    ): Promise<DIDCommHelper> => {
      const ext = wallet.getExtensions()
      if (!ext) {
        throw ERROR_COMM_WS_UNKNOWN
      }

      return await new Promise(async (resolve) => {
        resolve(await new Promise(async (resolve, reject) => {
          let sentOnce = false
          await ext.triggerEvent<InitCommEventParams>(wallet, EVENT_INIT_CONNECTION, {
            statusHandle: { established: false },
            resolveConnection: async (helper) => {
              if (sentOnce) {
                return
              }
              sentOnce = true
              console.log('TRY CONNECTION', conn)
              if (!wallet.did.helper().isDIDDocument(conn.sender)) {
                throw ERROR_NO_IDENTITY
              }

              let toReturn: DIDCommListner | undefined = undefined
              if (listener) {
                toReturn = listener(helper)
                await helper.addListener(toReturn)
              }

              if (doc) {
                if (!await helper.send(doc, conn)) {
                  toReturn && await helper.removeListener(toReturn)
                  reject(ERROR_COMM_CANT_SEND)
                }
                toReturn && await helper.removeListener(toReturn)
              }

              resolve(helper)
            },
            rejectConnection: async (err) => {
              console.error(err)
              reject(err)
            }
          })
        }))
      })
    }
  }
}

