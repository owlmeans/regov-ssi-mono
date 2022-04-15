
import { generateKeyPairFromSeed } from '@stablelib/x25519'
import {
  CryptoKey, DIDDocument, DIDHelper, DIDPURPOSE_AGREEMENT, KEYCHAIN_ERROR_NO_KEY, KeyPairToCryptoKeyOptions
} from "@owlmeans/regov-ssi-core"
import { CommKey, COMM_DID_AGREEMENT_KEY_DEFAULT, connectionFieldList, DIDCommConnectMeta, ERROR_COMM_DID_NOKEY, ERROR_COMM_NO_RECIPIENT } from "./types"
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