
import {
  buildVPV1,
  buildVPV1Unsigned,
  validateVPV1
} from "@affinidi/vc-common"

import {
  BuildSSICoreMethod,
  BuildCredentailOptions,
  SignCredentialOptions,
  BuildPresentationOptions,
  SignPresentationOptions,
  ERROR_NO_PRESENTATION_SIGNING_KEY,
  ERROR_NO_CREDENTIAL_SIGNING_KEY,
} from "./ssi/types"
import {
  Credential,
  CredentialSubject,
  WrappedDocument,
  UnsignedCredential,
  Presentation,
  PresentationHolder,
  UnsignedPresentation,
} from './types'
import {
  COMMON_CRYPTO_ERROR_NOID,
  COMMON_CRYPTO_ERROR_NOPK,
  COMMON_CRYPTO_ERROR_NOPUBKEY,
  basicHelper,
  COMMON_CRYPTO_ERROR_NOKEY
} from "@owlmeans/regov-ssi-common"
import {
  DIDDocument,
  buildDocumentLoader,
  DID_REGISTRY_ERROR_NO_DID,
  DID_REGISTRY_ERROR_NO_KEY_BY_DID,
  VERIFICATION_KEY_HOLDER,
  VERIFICATION_KEY_CONTROLLER
} from "@owlmeans/regov-ssi-did"

const jsigs = require('jsonld-signatures')

/**
 * @TODO Sign and verify VC with nonce from did.
 * Probably it can be done on the subject level
 */
export const buildSSICore: BuildSSICoreMethod = async ({
  keys,
  crypto,
  did,
  defaultSchema
}) => {
  const documentLoader = buildDocumentLoader(did)(() => undefined)

  return {
    keys,

    crypto,

    did,

    buildContext: (url, extendedCtx?, baseUrl?) => {
      const uri = `${baseUrl || defaultSchema || 'https://example.org'}${url ? `/${url}` : ''}#`
      return {
        '@version': 1.1,
        scm: uri,
        data: extendedCtx
          ? {
            '@context': {
              '@version': 1.1,
              'scmdata': `${baseUrl || defaultSchema || 'https://example.org'}${url ? `/${url}/data` : ''}#`
            },
            '@id': `scmdata:id`,
            '@type': 'scmdata:type'
          }
          : { '@id': 'scm:data', '@type': '@json' },
        ...extendedCtx
      }
    },

    buildCredential: async <
      T extends WrappedDocument = WrappedDocument,
      S extends CredentialSubject<T> = CredentialSubject<T>,
      U extends UnsignedCredential<S> = UnsignedCredential<S>
    >(options: BuildCredentailOptions<T>) => {
      const credential = {
        '@context': [
          'https://www.w3.org/2018/credentials/v1'
        ],
        id: options.id,
        type: options.type,
        holder: options.holder,
        credentialSubject: options.subject,
      }

      return {
        ...credential,
        issuanceDate: options.issueanceDate || (new Date).toISOString()
      } as U
    },

    signCredential: async <
      S extends CredentialSubject = CredentialSubject,
      C extends Credential<S> = Credential<S>
    >(
      unsingedCredential: UnsignedCredential<S>,
      issuer?: DIDDocument,
      options?: SignCredentialOptions
    ) => {
      issuer = issuer || unsingedCredential.holder
      const keyId = options?.keyId 
      || (
        did.helper().extractProofController(issuer) === unsingedCredential.holder.id
        ? VERIFICATION_KEY_HOLDER
        : VERIFICATION_KEY_CONTROLLER
      )

      const key = await did.extractKey(issuer, keyId)
      if (!key) {
        throw new Error(ERROR_NO_CREDENTIAL_SIGNING_KEY)
      }

      await keys.expandKey(key)
      if (!key.pk) {
        throw new Error(COMMON_CRYPTO_ERROR_NOPK)
      }

      try {
        return await jsigs.sign(
          { ...unsingedCredential, issuer },
          {
            suite: await crypto.buildSignSuite({
              publicKey: key.pubKey as string,
              privateKey: key.pk as string,
              id: `${issuer.id}#${keyId}`,
              controller: issuer.id
            }),
            documentLoader,
            purpose: new jsigs.purposes.AssertionProofPurpose({}),
            compactProof: false,
          }
        ) as C
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
      const key = await did.extractKey(didDoc, keyId)
      if (!key) {
        throw new Error(DID_REGISTRY_ERROR_NO_KEY_BY_DID)
      }
      if (!key.pubKey) {
        throw new Error(COMMON_CRYPTO_ERROR_NOPUBKEY)
      }

      const result = await jsigs.verify(credential, {
        suite: await crypto.buildSignSuite({
          publicKey: key.pubKey,
          privateKey: '',
          id: credential.proof.verificationMethod,
          controller: didDoc.id
        }),
        documentLoader,
        purpose: new jsigs.purposes.AssertionProofPurpose({ controller: didDoc }),
        compactProof: false,
      })

      return [true, result]
    },

    buildPresentation: async <
      C extends Credential = Credential,
      H extends PresentationHolder = PresentationHolder
    >(credentails: C[], options: BuildPresentationOptions) => {
      return buildVPV1Unsigned({
        id: options.id || `urn:uuid:${basicHelper.makeRandomUuid()}`,
        vcs: [...credentails],
        holder: {
          id: options.holder
        },
        context: options.context,
        type: options.type
      }) as UnsignedPresentation<C, H>
    },

    signPresentation: async<
      C extends Credential = Credential,
      H extends PresentationHolder = PresentationHolder
    >(
      unsignedPresentation: UnsignedPresentation<C, H>,
      holder: DIDDocument,
      options?: SignPresentationOptions
    ) => {
      const keyId = options?.keyId || did.helper().extractKeyId(holder.proof.verificationMethod)
      const key = await did.extractKey(holder, keyId)
      if (!key) {
        throw new Error(ERROR_NO_PRESENTATION_SIGNING_KEY)
      }

      await keys.expandKey(key)
      if (!key.pk) {
        throw new Error(COMMON_CRYPTO_ERROR_NOPK)
      }
      if (!key.id) {
        throw new Error(COMMON_CRYPTO_ERROR_NOID)
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
      }) as Presentation<C, H>
    },

    verifyPresentation: async (presentation, didDoc?, localLoader?) => {
      const _updateDidDoc = async (didId: string): Promise<DIDDocument | undefined> => {
        if (localLoader) {
          const doc = await localLoader(
            did.helper(),
            buildDocumentLoader(did),
            presentation,
            didDoc
          )(didId)
          if (doc && did.helper().isDIDDocument(doc.document)) {
            return doc.document
          }
        }
      }

      const result = await validateVPV1({
        documentLoader:
          localLoader
            ? localLoader(did.helper(), buildDocumentLoader(did), presentation, didDoc)
            : didDoc
              ? buildDocumentLoader(did)(() => didDoc) : documentLoader,
        getVerifySuite: async (options) => {
          const didId = did.helper().parseDIDId(options.verificationMethod)
          let _didDoc = await did.lookUpDid<DIDDocument>(didId.did)
          if (_didDoc) {
            didDoc = _didDoc
          } else {
            didDoc = await _updateDidDoc(didId.did) || didDoc
          }
          if (!didDoc) {
            throw new Error(DID_REGISTRY_ERROR_NO_DID)
          }

          const key = await did.extractKey(
            didDoc,
            did.helper().extractKeyId(options.verificationMethod)
          )
          if (!key) {
            throw new Error(DID_REGISTRY_ERROR_NO_KEY_BY_DID)
          }

          if (!key.pubKey) {
            throw new Error(COMMON_CRYPTO_ERROR_NOPUBKEY)
          }

          return crypto.buildSignSuite({
            publicKey: key.pubKey,
            privateKey: '',
            controller: didId.did,
            id: options.verificationMethod
          })
        },
        getProofPurposeOptions: async (options) => {
          let controller = <DIDDocument>await did.lookUpDid(options.controller)

          /**
           * @TODO There is, PROBABLY, some problem here.
           * agent/verifier/crednetial/response/verify doesnt' work in test
           * No other methods in credential test of agent can find the controller.
           * So there is a question if the signature really prooved on previous steps.
           */
          if (!controller) {
            controller = await _updateDidDoc(options.controller) as DIDDocument
          }

          return { controller }
        }
      })(presentation)

      if (result.kind !== 'valid') {
        return [false, result]
      }

      return [true, result]
    }
  }
}