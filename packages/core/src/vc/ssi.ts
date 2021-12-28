
import {
  BuildSSICoreMethod,
  BuildCredentailOptions,
  SignCredentialOptions,
  BuildPresentationOptions,
  SignPresentationOptions,
  ERROR_NO_PRESENTATION_SIGNING_KEY,
  ERROR_NO_CREDENTIAL_SIGNING_KEY,
  VerifyPresentationResult,
  SSICore,
} from "./ssi/types"
import {
  Credential,
  CredentialSubject,
  WrappedDocument,
  UnsignedCredential,
  Presentation,
  PresentationHolder,
  UnsignedPresentation,
  BASE_CREDENTIAL_TYPE,
  ERROR_EVIDENCE_ISNT_TRUSTED,
  ERROR_EVIDENCE_ISNT_CREDENTIAL,
  ERROR_CREDENTAILSCHEMA_ISNT_SUPPORTED,
  SUBJECT_ONLY_CREDENTIAL_SCHEMA_TYPE,
  ERROR_CREDENTAILSCHEMA_UNKNOWN_ERROR
} from './types'
import {
  COMMON_CRYPTO_ERROR_NOID,
  COMMON_CRYPTO_ERROR_NOPK,
  COMMON_CRYPTO_ERROR_NOPUBKEY,
  basicHelper,
  mapValue,
  MaybeArray,
  addToValue,
  convertToSchema,
  CREDENTIAL_SCHEMA_TYPE_2020,
  validateSchema
} from "@owlmeans/regov-ssi-common"
import {
  DIDDocument,
  buildDocumentLoader,
  DID_REGISTRY_ERROR_NO_DID,
  DID_REGISTRY_ERROR_NO_KEY_BY_DID,
  VERIFICATION_KEY_HOLDER,
  VERIFICATION_KEY_CONTROLLER,
  BuildDocumentLoader,
} from "@owlmeans/regov-ssi-did"
import {
  isCredential,
  isFullEvidence,
  isFullCredentialSchema
} from "./util"

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

  const _core: SSICore = {
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
          'https://www.w3.org/2018/credentials/v1',
          ...(options.context
            ? Array.isArray(options.context) ? options.context : [options.context]
            : []
          ),
        ],
        ...(options.id ? { id: options.id } : {}),
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
      unsingedCredential: UnsignedCredential<MaybeArray<S>>,
      issuer?: DIDDocument,
      options?: SignCredentialOptions
    ) => {
      if (!issuer) {
        /**
         * @TODO The holder can be an unsigned document and this is the issue
         * it should be actually signed first
         */
        issuer = unsingedCredential.holder as DIDDocument
      }

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
            purpose: new jsigs.purposes.AssertionProofPurpose({ controller: issuer }),
            compactProof: false,
          }
        ) as C
      } catch (e: any) {
        console.log(e.details)

        throw e
      }
    },

    verifyCredential: async (credential, didDoc, options) => {
      const keyId = typeof options === 'string' ? options : options?.keyId
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

      if (result.verified && typeof options === 'object') {
        if (options.verifyEvidence) {
          const [evidenceResult, evidenceErrors] = await _core.verifyEvidence(credential, undefined, {
            nonStrictEvidence: options.nonStrictEvidence,
            localLoader: options.localLoader
          })
          if (!evidenceResult) {
            result.verified = false
            result.error = {
              errors: [{ kind: 'evidence', message: evidenceErrors[0].message }]
            }
          }
        }
        if (result.verified && options.verifySchema) {
          const [schemaResult, schemaErrors] = await _core.verifySchema(credential, undefined, {
            nonStrictEvidence: options.nonStrictEvidence,
            localLoader: options.localLoader
          })
          if (!schemaResult) {
            result.verified = false
            result.error = {
              errors: [{ kind: 'schema', message: schemaErrors[0].message }]
            }
          }
        }
      }

      return [
        result.verified,
        result.verified
          ? { kind: 'valid', data: credential }
          : { kind: 'invalid', errors: result.error.errors }
      ]
    },

    buildPresentation: async <
      C extends Credential = Credential,
      H extends PresentationHolder = PresentationHolder
    >(credentails: C[], options: BuildPresentationOptions) => {
      return {
        '@context': addToValue('https://www.w3.org/2018/credentials/v1', options.context),
        ...(options.id ? { id: options.id } : {}),
        type: addToValue('VerifiablePresentation', options.type),
        holder: options.holder,
        verifiableCredential: credentails,
      } as unknown as UnsignedPresentation<C, H>
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

      try {
        return await jsigs.sign(
          { ...unsignedPresentation },
          {
            suite: await crypto.buildSignSuite({
              publicKey: key.pubKey as string,
              privateKey: key.pk as string,
              id: `${holder.id}#${keyId}`,
              controller: holder.id
            }),
            documentLoader,
            purpose: new jsigs.purposes.AuthenticationProofPurpose({
              challenge: options?.challange || unsignedPresentation.id || basicHelper.makeRandomUuid(),
              domain: options?.domain || holder.id
            }),
            compactProof: false,
          }
        ) as Presentation<C, H>
      } catch (e: any) {
        console.log(e.details)

        throw e
      }
    },

    verifyPresentation: async (presentation, didDoc?, options?) => {
      const localLoader = typeof options === 'function' ? options : options?.localLoader
      const testEvidence = typeof options === 'object' ? options.testEvidence : false
      const nonStrictEvidence = typeof options !== 'function' ? options?.nonStrictEvidence : false
      didDoc = didDoc || (
        did.helper().isDIDDocument(presentation.holder) ? presentation.holder : undefined
      )
      const _updateDidDoc = async (didId: string): Promise<DIDDocument | undefined> => {
        if (localLoader) {
          const doc = await localLoader(
            did.helper(),
            buildDocumentLoader(did) as BuildDocumentLoader<Credential>,
            presentation,
            didDoc
          )(didId)
          if (doc) {
            if (did.helper().isDIDDocument(doc.document)) {
              return doc.document
            } else if (isCredential(doc.document) && typeof doc.document.issuer === 'object') {
              return doc.document.issuer
            }
          }
        }
      }

      /**
       * @TODO Fix any type of options
       */
      const _gerVerifySuite = async (options: any) => {
        const didId = did.helper().parseDIDId(options.verificationMethod)
        let _didDoc = await did.lookUpDid<DIDDocument>(didId.did)
        if (!_didDoc) {
          _didDoc = await _updateDidDoc(didId.did)
        }
        if (!_didDoc) {
          throw new Error(DID_REGISTRY_ERROR_NO_DID)
        }

        const key = await did.extractKey(
          _didDoc,
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
      }

      /**
       * @TODO Fix any type of options
       */
      const _getProofPurposeOptions = async (options: any) => {
        options.controller = options.controller.id || options.controller
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

      const _documentLoader = localLoader
        ? localLoader(
          did.helper(),
          buildDocumentLoader(did) as BuildDocumentLoader<Credential>,
          presentation,
          didDoc
        )
        : didDoc ? buildDocumentLoader(did)(() => didDoc) : documentLoader


      let result: VerifyPresentationResult<Presentation> = {
        kind: 'invalid',
        errors: []
      }

      const credsResult = await presentation.verifiableCredential.reduce(
        async (_result, credential) => {
          if (!await _result) {
            return false
          }
          const credResult = await jsigs.verify(
            credential,
            {
              suite: await _gerVerifySuite({
                verificationMethod: credential.proof.verificationMethod
              }),
              documentLoader: _documentLoader,
              purpose: new jsigs.purposes.AssertionProofPurpose(
                await _getProofPurposeOptions({
                  controller: credential.issuer || credential.holder
                })
              ),
              compactProof: false,
            }
          )

          if (testEvidence && credResult.verified && credential.evidence) {
            const [evidenceResult, evidenceErrors] = await _core.verifyEvidence(
              credential, presentation, { localLoader, nonStrictEvidence }
            )
            credResult.verified = evidenceResult
            if (!evidenceResult) {
              credResult.error = { errors: evidenceErrors }
            }
          }

          if (credResult.verified && credential.credentialSchema) {
            const [schemaResult, schemaErrors] = await _core.verifySchema(
              credential, presentation, { localLoader, nonStrictEvidence }
            )
            credResult.verified = schemaResult
            if (!schemaResult) {
              credResult.error = { errors: schemaErrors }
            }
          }

          if (credResult.verified) {
            return true
          }

          result = {
            kind: 'invalid',
            errors: [
              ...result.kind === 'invalid' ? result.errors : [],
              ...credResult.error.errors
            ]
          }

          return false
        },
        Promise.resolve(true)
      )

      if (credsResult) {
        const presResult = await jsigs.verify(
          presentation,
          {
            suite: await _gerVerifySuite({
              verificationMethod: presentation.proof.verificationMethod
            }),
            documentLoader: _documentLoader,
            purpose: new jsigs.purposes.AuthenticationProofPurpose({
              challenge: presentation.proof.challenge,
              domain: presentation.proof.domain,
              ...await _getProofPurposeOptions({
                controller: presentation.holder
              })
            }),
            compactProof: false,
          }
        )

        if (presResult.verified) {
          result = {
            kind: 'valid',
            data: presentation
          }
        } else {
          result = {
            kind: 'invalid',
            errors: [
              ...result.kind === 'invalid' ? result.errors : [],
              ...presResult.error.errors
            ]
          }
        }
      }

      return [result.kind === 'valid', result]
    },

    verifyEvidence: async (credential, presentation, options) => {
      const localLoader = typeof options === 'function' ? options : options?.localLoader
      const nonStrictEvidence = typeof options === 'object' ? options.nonStrictEvidence : false
      if (credential.evidence) {
        const _documentLoader = localLoader && presentation
          ? localLoader(
            did.helper(),
            buildDocumentLoader(did) as BuildDocumentLoader<Credential>,
            presentation
          ) : documentLoader

        const result = await mapValue(credential.evidence, async evidence => {
          if (evidence.type.includes(BASE_CREDENTIAL_TYPE)) {
            const fullEvidence = isFullEvidence(evidence)
              ? evidence : (await _documentLoader(evidence.id)).document

            if (isCredential(fullEvidence)) {
              const [result, info] = await _core.verifyCredential(fullEvidence)
              if (result) {
                if (fullEvidence.evidence) {
                  return _core.verifyEvidence(fullEvidence, presentation, options)
                }
                if (nonStrictEvidence) {
                  return [true, []]
                }

                const finalResult = !!await did.lookUpDid(evidence.id)
                return [finalResult, [new Error(ERROR_EVIDENCE_ISNT_TRUSTED)]]
              }

              return [
                false,
                info.kind === 'invalid' && info.errors.map(error => new Error(error.message))
              ]
            }

            return [false, [new Error(ERROR_EVIDENCE_ISNT_CREDENTIAL)]]
          }

          return [true, []]
        })

        if (result.some(([res]) => !res)) {
          return [false, result.filter(([, errors]) => errors).flatMap(
            ([, errors]) => Array.isArray(errors) ? errors : []
          )]
        }
      }

      return [true, []]
    },

    verifySchema: async (credential, presentation, options) => {
      const localLoader = typeof options === 'function' ? options : options?.localLoader
      const nonStrictEvidence = typeof options === 'object' ? options.nonStrictEvidence : false
      if (credential.credentialSchema) {
        const _documentLoader = localLoader && presentation
          ? localLoader(
            did.helper(),
            buildDocumentLoader(did) as BuildDocumentLoader<Credential>,
            presentation
          ) : documentLoader

        const result = await mapValue(credential.credentialSchema, async schema => {
          if (schema.type.includes(BASE_CREDENTIAL_TYPE)) {
            if (schema.type.includes(CREDENTIAL_SCHEMA_TYPE_2020)) {
              const fullSchema = isFullCredentialSchema(schema)
                ? schema : (await _documentLoader(schema.id)).document

              if (isCredential(fullSchema)) {
                const [credSchemaResult, credSchameInfo] = await _core.verifyCredential(fullSchema)
                if (!credSchemaResult) {
                  return [
                    false,
                    credSchameInfo.kind === 'invalid' && credSchameInfo.errors.map(
                      error => new Error(error.message)
                    )
                  ]
                }
                const [schemaEvidenceResult, schemaEvidenceInfo] = await _core.verifyEvidence(
                  fullSchema, presentation, { localLoader, nonStrictEvidence }
                )
                if (!schemaEvidenceResult) {
                  return [false, schemaEvidenceInfo]
                }

                const [schemaResult, schemaInfo] = validateSchema(
                  fullSchema.type.includes(SUBJECT_ONLY_CREDENTIAL_SCHEMA_TYPE)
                    ? credential.credentialSubject
                    : credential,
                  convertToSchema(fullSchema.credentialSubject)
                )

                if (!schemaResult) {
                  return [false, Array.isArray(schemaInfo) ? schemaInfo.map(
                    error => new Error(error.message || error.keyword)
                  ) : [new Error(ERROR_CREDENTAILSCHEMA_UNKNOWN_ERROR)]]
                }
              }
            }
          }

          return [false, [new Error(ERROR_CREDENTAILSCHEMA_ISNT_SUPPORTED)]]
        })

        if (result.some(([res]) => !res)) {
          return [false, result.filter(([, errors]) => errors).flatMap(
            ([, errors]) => Array.isArray(errors) ? errors : []
          )]
        }
      }

      return [true, []]
    }
  }

  return _core
}
