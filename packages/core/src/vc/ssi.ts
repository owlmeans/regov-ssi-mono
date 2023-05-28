/**
 *  Copyright 2023 OwlMeans
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
  BuildSSICoreMethod, BuildCredentailOptions, SignCredentialOptions, BuildPresentationOptions,
  SignPresentationOptions, ERROR_NO_PRESENTATION_SIGNING_KEY, ERROR_NO_CREDENTIAL_SIGNING_KEY,
  VerifyPresentationResult, SSICore
} from "./ssi/types"
import {
  Credential, UnsignedCredential, Presentation, ERROR_CREDENTAILSCHEMA_UNKNOWN_ERROR,
  PresentationHolder, UnsignedPresentation, BASE_CREDENTIAL_TYPE, ERROR_EVIDENCE_ISNT_TRUSTED,
  ERROR_EVIDENCE_ISNT_CREDENTIAL, ERROR_CREDENTIALSCHEMA_ISNT_SUPPORTED, SUBJECT_ONLY_CREDENTIAL_SCHEMA_TYPE
} from './types'
import {
  COMMON_CRYPTO_ERROR_NOID, COMMON_CRYPTO_ERROR_NOPK, COMMON_CRYPTO_ERROR_NOPUBKEY, makeRandomUuid,
  mapValue, MaybeArray, addToValue, convertToSchema, CREDENTIAL_SCHEMA_TYPE_2020, validateSchema, singleValue, normalizeValue
} from '../common'
import {
  DIDDocument, buildDocumentLoader, documentWarmer, DID_REGISTRY_ERROR_NO_DID,
  DID_REGISTRY_ERROR_NO_KEY_BY_DID, VERIFICATION_KEY_HOLDER, VERIFICATION_KEY_CONTROLLER,
  BuildDocumentLoader,
} from '../did'
import { isCredential, isFullEvidence, isFullCredentialSchema } from './util'
import vcContext from '../docs/vc.context.json'


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

  documentWarmer('https://www.w3.org/2018/credentials/v1', JSON.stringify({ '@context': vcContext }))

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
      S extends {} = {},
      U extends UnsignedCredential<S> = UnsignedCredential<S>
    >(options: BuildCredentailOptions<S>) => {
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
      S extends {} = {},
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
          did.helper().extractProofController(issuer) === (unsingedCredential.holder as DIDDocument).id
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
            addSuiteContext: false
          }
        ) as C
      } catch (e: any) {
        console.error(e.details)

        throw e
      }
    },

    verifyCredential: async (credential, didDoc, options) => {
      const keyId = typeof options === 'string' ? options : options?.keyId
      if (!didDoc) {
        didDoc = credential.issuer as DIDDocument // || credential.holder as DIDDocument
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
            result.error = { errors: [{ kind: 'evidence', message: evidenceErrors[0].message }] }
          }
        }
        if (result.verified && options.verifySchema) {
          const [schemaResult, schemaErrors] = await _core.verifySchema(credential, undefined, {
            nonStrictEvidence: options.nonStrictEvidence,
            localLoader: options.localLoader
          })
          if (!schemaResult) {
            result.verified = false
            result.error = { errors: [{ kind: 'schema', message: schemaErrors[0].message }] }
          }
        }
      }

      if (result.verified && credential.expirationDate) {
        console.log('Verify dates', new Date(Date.parse(credential.expirationDate ?? '')), new Date())
        if (new Date(credential.expirationDate ?? '') < new Date()) {
          result.verified = false
          result.error = { errors: [{ kind: 'expired', message: 'credential.expired' }] }
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
      } as unknown as UnsignedPresentation<C>
    },

    signPresentation: async<
      C extends Credential = Credential,
    >(
      unsignedPresentation: UnsignedPresentation<C>,
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
              challenge: options?.challenge || unsignedPresentation.id || makeRandomUuid(),
              domain: options?.domain || holder.id
            }),
            compactProof: false,
          }
        ) as Presentation<C>
      } catch (e: any) {
        console.error(e.details)

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
      if (did.helper().isDIDDocument(presentation.holder)) {
        const pubKey = singleValue(presentation.holder.verificationMethod)?.publicKeyBase58
        const unknownIdAndStates = normalizeValue(presentation.verifiableCredential).map(cred => {
          if (cred.issuer && did.helper().isDIDDocument(cred.issuer)) {
            if (normalizeValue(cred.issuer.verificationMethod).some(
              method => method?.publicKeyBase58 === pubKey
            )) {
              return [cred.id, true]
            }
          }
          if (cred.holder && did.helper().isDIDDocument(cred.holder)) {
            if (normalizeValue(cred.holder.verificationMethod).some(
              method => method?.publicKeyBase58 === pubKey
            )) {
              return [cred.id, true]
            }
          }

          return [cred.id, false]
        }).filter(([, state]) => !state)

        if (unknownIdAndStates.length > 0) {
          return [false, {
            kind: 'invalid',
            errors: unknownIdAndStates.map(([id]) => {
              return { kind: 'foreign', message: id }
            }) as unknown as { kind: string, message: string }[] || [{ kind: 'foreign', message: 'unknown' }]
          }]
        }
      }
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
              return doc.document.issuer as DIDDocument
            }
          }
        }
      }

      /**
       * @TODO Fix any type of options
       */
      const _getVerifySuite = async (options: any) => {
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

          const [res, credResult] = await _core.verifyCredential(credential, undefined, {
            localLoader,
            nonStrictEvidence,
            verifyEvidence: testEvidence
          })

          if (!res && credResult.kind === 'invalid') {
            result = credResult
          }

          return res
        },
        Promise.resolve(true)
      )

      if (credsResult) {
        const presResult = await jsigs.verify(
          presentation,
          {
            suite: await _getVerifySuite({
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

          return [false, [new Error(ERROR_CREDENTIALSCHEMA_ISNT_SUPPORTED)]]
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
