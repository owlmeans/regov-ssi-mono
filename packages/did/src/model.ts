import {
  CryptoKey,
  CryptoHelper,
  COMMON_CRYPTO_ERROR_NOPK,
  COMMON_CRYPTO_ERROR_NOPUBKEY,
  COMMON_CRYPTO_ERROR_NOID
} from 'metabelarusid-common'
import {
  DIDDocumnet,
  DIDPURPOSE_VERIFICATION,
  DIDHelper,
  DEFAULT_DID_PREFIX,
  MakeDIDIdOptions,
  DIDDocumentPurpose,
  DIDDocumentPayload,
  didPurposeList,
  DID_ERROR_NOVERIFICATION_METHOD
} from 'types'

export const buildDidHelper =
  (crypto: CryptoHelper, didPrefix = DEFAULT_DID_PREFIX): DIDHelper => {
    const _makeDIDId = (key: CryptoKey, options: MakeDIDIdOptions = {}) => {
      if (!key.id) {
        throw new Error(COMMON_CRYPTO_ERROR_NOID)
      }

      return `did:${didPrefix}:${crypto.makeId(
        key.id,
        options.data && options.hash ? crypto.hash(options.data) : options.data,
        options.expand
      )}`
    }

    const _cleanUpDid = (did: string) => did.split(':')[2]

    const _makeDIDProofSignature = (key: CryptoKey, id: string, nonce: string, purposes: DIDDocumentPurpose[]) => {
      if (!key.pk) {
        throw new Error(COMMON_CRYPTO_ERROR_NOPK)
      }
      return crypto.sign(`${nonce}:${purposes.join('|')}:${id}`, key.pk)
    }

    const _verifyDIDProofSignature = (didDoc: DIDDocumnet, key?: CryptoKey) => {
      if (!didDoc.proof.verificationMethod && !key?.pubKey) {
        throw new Error(DID_ERROR_NOVERIFICATION_METHOD)
      }
      const purposes = didPurposeList.filter(
        purpose => didDoc.hasOwnProperty(purpose)
      )

      key = key || {
        pubKey: <string>didDoc.publicKey.find(
          pubKey => pubKey.id === didDoc.proof.verificationMethod
        )?.publicKeyBase58
      }

      if (!key.pubKey) {
        throw new Error(COMMON_CRYPTO_ERROR_NOPUBKEY)
      }

      return crypto.verify(
        didDoc.proof.signature,
        `${didDoc.proof.nonce}:${purposes.join('|')}:${didDoc.id}`,
        key.pubKey
      )
    }

    return {
      makeDIDId: _makeDIDId,

      makeDIDProofSignature: _makeDIDProofSignature,

      verifyDIDProofSignature: _verifyDIDProofSignature,

      createDID: async (key, options = {}) => {
        if (!key.pubKey) {
          throw new Error(COMMON_CRYPTO_ERROR_NOPUBKEY)
        }
        const id = _makeDIDId(key, options)
        const nonce = crypto.base58().encode(await crypto.getRandomBytes(8))

        let purposes = options.purpose || [DIDPURPOSE_VERIFICATION]
        if (!Array.isArray(purposes)) {
          purposes = [purposes]
        }

        const controller = _makeDIDId(key)

        const didDoc: DIDDocumnet = {
          '@context': [
            'https://w3id.org/security/v2'
          ],
          id,
          ...purposes.reduce((memo: DIDDocumentPayload, purpose) => {
            if (!key.pubKey) {
              throw new Error(COMMON_CRYPTO_ERROR_NOPUBKEY)
            }

            memo[purpose] = [{
              id: `${id}#${purpose}-1`,
              type: 'Secp256k1VerificationKey',
              publicKeyBase58: key.pubKey
            }]

            return memo
          }, {}),
          proof: {
            type: 'Secp256k1Signature',
            controller,
            nonce,
            created: new Date().toISOString(),
            signature: _makeDIDProofSignature(key, id, nonce, purposes),
            verificationMethod: `${controller}#publicKey-1`
          },
          publicKey: [{
            id: `${controller}#publicKey-1`,
            type: 'Secp256k1Signature',
            publicKeyBase58: key.pubKey
          }]
        };

        return {
          ...didDoc,
          proof: didDoc.proof
        }
      }
    }
  }