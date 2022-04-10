
import { generateKeyPairFromSeed } from '@stablelib/x25519'
import {
  CryptoKey, DIDDocument, DIDHelper, DIDPURPOSE_AGREEMENT, KEYCHAIN_ERROR_NO_KEY, KeyPairToCryptoKeyOptions
} from "@owlmeans/regov-ssi-core"
import { CommKey, ERROR_COMM_DID_NOKEY } from "./types"


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

export const didDocToCommKeyBuilder = (helper: DIDHelper) =>
  async (did: DIDDocument): Promise<Partial<CommKey>> => {
    const agreement = helper.expandVerificationMethod(did, DIDPURPOSE_AGREEMENT)
    if (!agreement.publicKeyHex) {
      throw new Error(ERROR_COMM_DID_NOKEY)
    }
    
    return {
      id: did.id,
      pubKey: Buffer.from(agreement.publicKeyHex, 'hex')
    }
  }