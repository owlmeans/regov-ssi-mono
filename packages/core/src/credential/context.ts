
import { buildVCV1, buildVCV1Skeleton, buildVCV1Unsigned, buildVPV1, buildVPV1Unsigned, validateVCV1, validateVPV1 } from "@affinidi/vc-common"

import { BuildCommonContextMethod, CommonBuildCredentailOptions, CommonSignCredentialOptions } from "./context/types"
import { CommonCredentail, CommonCredentailSubject, CommonSubjectType, CommonUnsignedCredential } from "./context/types/credential"
import {
  COMMON_CRYPTO_ERROR_NOID,
  COMMON_CRYPTO_ERROR_NOPK,
  COMMON_CRYPTO_ERROR_NOPUBKEY,
  CommonCryptoKey,
  basicHelper,
  COMMON_CRYPTO_ERROR_NOKEY
} from "@owlmeans/regov-ssi-common"
import { CommonPresentation, CommonPresentationHolder, CommonUnsignedPresentation } from "./context/types/presentation"
import { CommonBuildPresentationOptions, CommonSignPresentationOptions } from '.'
import { DIDDocument, buildDocumentLoader, DIDPURPOSE_AUTHENTICATION, DID_REGISTRY_ERROR_NO_DID, DIDPURPOSE_ASSERTION, DID_REGISTRY_ERROR_NO_KEY_BY_DID } from "@owlmeans/regov-ssi-did"

/**
 * @TODO Sign and verify VC with nonce from did.
 * Probably it can be done on the subject level
 */
export const buildCommonContext: BuildCommonContextMethod = async ({
  keys,
  crypto,
  did
}) => {
  const documentLoader = buildDocumentLoader(did)(() => undefined)

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
      issuer: DIDDocument,
      options?: CommonSignCredentialOptions
    ) => {
      const key = await did.extractKey(issuer, `${DIDPURPOSE_ASSERTION}-${options?.keyId || '1'}`)
      if (!key) {
        throw new Error(COMMON_CRYPTO_ERROR_NOKEY)
      }

      await keys.expandKey(key)
      if (!key.pk) {
        throw new Error(COMMON_CRYPTO_ERROR_NOPK)
      }

      try {
        return await buildVCV1({
          unsigned: unsingedCredential,
          issuer: {
            did: issuer.id,
            keyId: key.fragment || 'publicKey-1',
            privateKey: key.pk,
            publicKey: key.pubKey
          },
          getSignSuite: (options) => {
            // console.log('Sign VC',options)
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

    verifyCredential: async (credential, didDoc, keyId) => {
      if (!didDoc) {
        didDoc = credential.issuer
      }
      if (typeof didDoc !== 'object') {
        didDoc = await did.lookUpDid<DIDDocument>(didDoc)
      }
      if (!didDoc) {
        throw new Error(DID_REGISTRY_ERROR_NO_DID)
      }
      const key = await did.extractKey(didDoc, `${DIDPURPOSE_ASSERTION}-${keyId || '1'}`)
      if (!key) {
        throw new Error(DID_REGISTRY_ERROR_NO_KEY_BY_DID)
      }
      
      const result = await validateVCV1({
        getVerifySuite: (options) => {
          if (!key.pubKey) {
            throw new Error(COMMON_CRYPTO_ERROR_NOPUBKEY)
          }
          if (typeof didDoc !== 'object') {
            throw new Error(DID_REGISTRY_ERROR_NO_DID)
          }
          
          return crypto.buildSignSuite({
            publicKey: key.pubKey,
            privateKey: '',
            controller: didDoc.id,
            id: options.verificationMethod // key.id ? key.id : 
          })
        },
        getProofPurposeOptions: async () => {
          return {
            controller: didDoc
          }
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
        vcs: [...credentails],
        holder: {
          id: options.holder
        },
        context: options.context,
        type: options.type
      }) as CommonUnsignedPresentation<C, H>
    },

    signPresentation: async<
      C extends CommonCredentail = CommonCredentail,
      H extends CommonPresentationHolder = CommonPresentationHolder
    >(
      unsignedPresentation: CommonUnsignedPresentation<C, H>,
      holder: DIDDocument,
      options?: CommonSignPresentationOptions
    ) => {
      const keyId = `${DIDPURPOSE_AUTHENTICATION}-${options?.keyId || '1'}`
      const key = await did.extractKey(holder, keyId)
      if (!key) {
        throw new Error(COMMON_CRYPTO_ERROR_NOKEY)
      }

      await keys.expandKey(key)
      if (!key.pk) {
        throw new Error(COMMON_CRYPTO_ERROR_NOPK)
      }

      return await buildVPV1({
        unsigned: unsignedPresentation,
        holder: {
          did: holder.id,
          keyId: keyId,
          privateKey: key.pk,
          publicKey: key.pubKey
        },
        documentLoader,
        getSignSuite: (options) => {
          // console.log('Sign VP',options)
          return crypto.buildSignSuite({
            publicKey: <string>options.publicKey,
            privateKey: options.privateKey,
            id: `${options.controller}#${options.keyId}`,
            controller: options.controller
          })
        },
        getProofPurposeOptions: async () => ({
          challenge: options?.challange || unsignedPresentation.id || basicHelper.makeRandomUuid(),
          domain: options?.domain || holder.id
        }),
      }) as CommonPresentation<C, H>
    },

    verifyPresentation: async (presentation) => {
      const result = await validateVPV1({
        documentLoader,
        getVerifySuite: async (options) => {
          const didId = did.helper().parseDIDId(options.verificationMethod)
          const didDoc = await did.lookUpDid<DIDDocument>(didId.did)
          if (!didDoc) {
            throw new Error(DID_REGISTRY_ERROR_NO_DID)
          }
          
          const key = await did.extractKey(didDoc, didId.fragment || `${DIDPURPOSE_AUTHENTICATION}-1`)
          if (!key) {
            throw new Error(DID_REGISTRY_ERROR_NO_KEY_BY_DID)
          }
          
          if (!key.pubKey) {
            throw new Error(COMMON_CRYPTO_ERROR_NOPUBKEY)
          }
          // console.log('VP / VC verify',options, key)
          return crypto.buildSignSuite({
            publicKey: key.pubKey,
            privateKey: '',
            controller: didId.did,
            id: options.verificationMethod
          })
        },
        getProofPurposeOptions: async (options) => {
          const controller = <DIDDocument>await did.lookUpDid(options.controller)

          return {
            controller//: await did.lookUpDid(key.id as string)
          }
        }
      })(presentation)

      if (result.kind !== 'valid') {
        return [false, result]
      }

      return [true, result]
    }
  }
}