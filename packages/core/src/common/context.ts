
import { buildVCV1, buildVCV1Skeleton, buildVCV1Unsigned, validateVCV1 } from "@affinidi/vc-common";

import { BuildCommonContextMethod, CommonBuildCredentailOptions, CommonSignCredentialOptions, COMMON_CONTROLLER_ROLE_HOLDER } from "./types";
import { CommonCredentail, CommonCredentailSubject, CommonSubjectType, CommonUnsignedCredential } from "./types/credential";
import { COMMON_CRYPTO_ERROR_NOID, COMMON_CRYPTO_ERROR_NOPK, COMMON_CRYPTO_ERROR_NOPUBKEY, CryptoKey } from "metabelarusid-common"


export const buildCommonContext: BuildCommonContextMethod = async ({
  keys,
  crypto,
  did
}) => {
  const documentLoader = async (url: string): Promise<any> => {
    if (url.startsWith('did:')) {
      // @TODO Fix lookup by did for metabelarus purpose
      return {
        contextUrl: null,
        document: {
          '@context': [
            'https://w3id.org/security/v2',
            'https://w3id.org/did/v1'
          ],
          id: url,
          publicKey: [{
            id: `${url}#primary`,
            usage: 'signing',
            type: 'Secp256k1VerificationKey2018',
            publicKeyHex: Buffer.from(crypto.base58().decode(url.split(':')[2])).toString('hex')
          }],
          assertionMethod: [`${url}#primary`],
          authentication: [`${url}#primary`],
        },
        documentUrl: url,
      }
    }

    const jsonld = require('jsonld')

    return jsonld.documentLoaders.node()(url)
  }

  return {
    keys,

    crypto,

    did,

    buildCredential: async <
      T extends CommonSubjectType = CommonSubjectType,
      S extends CommonCredentailSubject<T> = CommonCredentailSubject<T>
    >(options: CommonBuildCredentailOptions<T>) => {
      const skeleton = buildVCV1Skeleton({
        context: options.context,
        id: options.id,
        type: options.type,
        holder: {
          id: options.holder
        },
        credentialSubject: options.subject,
      })

      return buildVCV1Unsigned({
        skeleton,
        issuanceDate: options.issueanceDate || (new Date).toISOString()
      }) as CommonUnsignedCredential<S>
    },

    signCredential: async <
      S extends CommonCredentailSubject = CommonCredentailSubject
    >(
      unsingedCredential: CommonUnsignedCredential<S>,
      issuer: string,
      key: CryptoKey,
      options?: CommonSignCredentialOptions
    ) => {
      if (!key.id) {
        throw new Error(COMMON_CRYPTO_ERROR_NOID)
      }
      if (!key.pk) {
        throw new Error(COMMON_CRYPTO_ERROR_NOPK)
      }

      try {
        return await buildVCV1({
          unsigned: unsingedCredential,
          issuer: {
            did: issuer,
            keyId: 'primary',// @TODO Get it from some input
            privateKey: key.pk,
            publicKey: key.pubKey
          },
          getSignSuite: (options) => {
            return crypto.buildSignSuite({
              publicKey: <string>options.publicKey,
              privateKey: options.privateKey,
              id: `${options.controller}#${options.keyId}`,
              controller: options.controller
            })
          },
          documentLoader,
          getProofPurposeOptions: options?.buildProofPurposeOptions
        }) as CommonCredentail<S>
      } catch (e) {
        console.log(e.details)

        throw e
      }
    },

    verifyCredential: async (credential, key: CryptoKey) => {
      const result = await validateVCV1({
        getVerifySuite: (options) => {
          if (!key.id) {
            throw new Error(COMMON_CRYPTO_ERROR_NOID)
          }
          if (!key.pubKey) {
            throw new Error(COMMON_CRYPTO_ERROR_NOPUBKEY)
          }

          return crypto.buildSignSuite({
            publicKey: key.pubKey,
            privateKey: key.pk || '',
            controller: options.controller,
            id: options.verificationMethod
          })
        },
        documentLoader
      })(credential)

      if (result.kind !== 'valid') {
        return [false, result]
      }

      return [true, result]
    }
  }
}