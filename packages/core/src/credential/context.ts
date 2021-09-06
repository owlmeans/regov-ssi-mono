
import { buildVCV1, buildVCV1Skeleton, buildVCV1Unsigned, buildVPV1Unsigned, validateVCV1 } from "@affinidi/vc-common"

import { BuildCommonContextMethod, CommonBuildCredentailOptions, CommonSignCredentialOptions } from "./context/types"
import { CommonCredentail, CommonCredentailSubject, CommonSubjectType, CommonUnsignedCredential } from "./context/types/credential"
import {
  COMMON_CRYPTO_ERROR_NOID,
  COMMON_CRYPTO_ERROR_NOPK,
  COMMON_CRYPTO_ERROR_NOPUBKEY,
  CommonCryptoKey,
  basicHelper
} from "@owlmeans/regov-ssi-common"
import { CommonPresentationHolder, CommonUnsignedPresentation } from "./context/types/presentation"
import { CommonBuildPresentationOptions } from '.'
import { getDocumentLoader } from "./context/loader"

/**
 * @TODO Sign and verify VC with nonce from did.
 * Probably it can be done on the subject level
 */
export const buildCommonContext: BuildCommonContextMethod = async ({
  keys,
  crypto,
  did
}) => {
  const documentLoader = getDocumentLoader(did)

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
      key: CommonCryptoKey,
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
            keyId: key.fragment || 'publicKey-1',// @TODO Get it from some input
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
      } catch (e: any) {
        console.log(e.details)

        throw e
      }
    },

    verifyCredential: async (credential, key: CommonCryptoKey) => {
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
    },

    buildPresentation: async <
      C extends CommonCredentail = CommonCredentail,
      H extends CommonPresentationHolder = CommonPresentationHolder
    >(credentails: C[], options: CommonBuildPresentationOptions<H>) => {
      return buildVPV1Unsigned({
        id: `urn:uuid:${basicHelper.makeRandomUuid()}`,
        vcs: credentails,
        holder: options.holder,
        context: options.context,
        type: options.type
      }) as CommonUnsignedPresentation<C, H>
    }
  }
}