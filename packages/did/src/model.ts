import {
  CommonCryptoKey,
  CryptoHelper,
  COMMON_CRYPTO_ERROR_NOPK,
  COMMON_CRYPTO_ERROR_NOPUBKEY,
  COMMON_CRYPTO_ERROR_NOID
} from '@owlmeans/regov-ssi-common'

import {
  DIDDocument,
  DIDPURPOSE_VERIFICATION,
  DIDHelper,
  DEFAULT_DID_PREFIX,
  MakeDIDIdOptions,
  DIDDocumentPayload,
  DID_ERROR_NOVERIFICATION_METHOD,
  DIDDocumentUnsinged,
  DID_ERROR_VERIFICATION_METHOD_AMBIGUOUS,
  DIDDocumentPurpose,
  DIDVerificationItem,
  didPurposeList,
  ParseDIDIdMethod,
  DID_ERROR_VERIFICATION_METHOD_LOOKUP,
  DID_ERROR_VERIFICATION_NO_VERIFICATION_METHOD,
  BuildDocumentLoader,
} from './types'

const jldsign = require('jsonld-signatures')

const VERIFICATION_METHOD = 'EcdsaSecp256k1VerificationKey2019'
const SIGNATURE_METHOD = 'EcdsaSecp256k1Signature2019'

/**
 * @TODO Verify DID fully:
 * 1. Verify that ids produces correctly
 */
export const buildDidHelper =
  (crypto: CryptoHelper, didPrefix = DEFAULT_DID_PREFIX): DIDHelper => {
    let __buildDocumentLoader: BuildDocumentLoader | undefined

    const _buildDocumentLoader = (didDoc: DIDDocument | DIDDocumentUnsinged) => {
      return __buildDocumentLoader && __buildDocumentLoader(() => didDoc)
    }

    const _makeDIDId = (key: CommonCryptoKey, options: MakeDIDIdOptions = {}) => {
      if (!key.id) {
        throw new Error(COMMON_CRYPTO_ERROR_NOID)
      }

      return `did:${didPrefix}:${!options.hash ? `${key.id}${options.data ? `:${options.data}` : ''}`
        : crypto.makeId(
          key.id,
          options.data && options.hash ? crypto.hash(options.data) : options.data,
          options.expand
        )
        }`
    }

    const _buildKeyPayload = (key: string) => {
      return { publicKeyBase58: key }
    }

    /**
     * @TODO Check listed purposes that they have proper stucture and ids 
     * in did document
     */
    const _verifySubjectSignature = async (didDoc: DIDDocument): Promise<boolean> => {
      if (!didDoc.verificationMethod) {
        return true
      }

      /** 
       * @TODO It can verify multiple signed verificationMethods, 
       * but only one can be created for now.
       */
      return await didDoc.verificationMethod.reduce(async (_result: Promise<boolean>, verification) => {
        const result = await _result
        if (!result) return false

        if (typeof verification === 'object' && verification.proof) {
          try {
            const res = await jldsign.verify(
              verification,
              {
                suite: crypto.buildSignSuite({
                  publicKey: verification.publicKeyBase58,
                  privateKey: '',
                  id: `${verification.proof.verificationMethod}`,
                  controller: `${verification.controller}`
                }),
                documentLoader: _buildDocumentLoader(didDoc),
                purpose: new jldsign.purposes.PublicKeyProofPurpose({
                  controller: didDoc
                }),
                compactProof: false,
              }
            )
            if (res.verified) {
              return true
            } else {
              console.log(res)
            }
          } catch (e) {
            console.log(e)
          }
          return false
        }

        return true
      }, Promise.resolve(true))
    }

    const _extractProofController = (did: DIDDocument) => {
      if (!did.proof.verificationMethod) {
        throw new Error(DID_ERROR_VERIFICATION_NO_VERIFICATION_METHOD)
      }
      const method = _expandVerificationMethod(did, did.proof.verificationMethod)
      if (!method?.controller) {
        return _parseDIDId(did.proof.verificationMethod).did
      }

      return method.controller
    }

    const _expandVerificationMethod
      = (didDoc: DIDDocument, method: string): DIDVerificationItem | undefined => {
        const isId = _isDIDId(method)
        let fragment = isId ? _parseDIDId(method).fragment : method
        if (!fragment) {
          throw new Error(DID_ERROR_VERIFICATION_METHOD_AMBIGUOUS)
        }

        const [source, index] = <[DIDDocumentPurpose, string]>fragment.split('-')
        if (!source) {
          throw new Error(DID_ERROR_VERIFICATION_METHOD_AMBIGUOUS)
        }
        if (!didDoc[source]) {
          throw new Error(DID_ERROR_NOVERIFICATION_METHOD)
        }
        const methodToExpand = didDoc[source]?.find(
          (_method, idx) => {
            if (!isId || typeof _method === 'string') {
              return idx + 1 === parseInt(index)
            }

            return _method.id === method
          }
        )

        if (typeof methodToExpand === 'string') {
          const parsedMethodToExpand = _parseDIDId(methodToExpand)
          const [_, expandIdx] = <[DIDDocumentPurpose, string]>(
            <string>parsedMethodToExpand.fragment
          ).split('-');
          return {
            ...(<DIDVerificationItem[]>didDoc.publicKey)[parseInt(expandIdx) - 1],
            id: methodToExpand
          }
        }

        return methodToExpand
      }

    const _verifyDID = async (didDoc: DIDDocument, key?: CommonCryptoKey) => {
      if (!didDoc.proof?.verificationMethod) {
        console.log('No proof or verification method')
        return false
      }
      if (!key?.pubKey) {
        if (!didDoc.proof.verificationMethod) {
          throw new Error(DID_ERROR_NOVERIFICATION_METHOD)
        }
        const method = _expandVerificationMethod(didDoc, didDoc.proof.verificationMethod)

        if (method?.publicKeyBase58) {
          key = {
            pubKey: method.publicKeyBase58
          }
        }
      }

      if (!key?.pubKey) {
        throw new Error(COMMON_CRYPTO_ERROR_NOPUBKEY)
      }

      try {
        const controller = _extractProofController(didDoc)
        const method = _expandVerificationMethod(
          didDoc,
          <string>_parseDIDId(didDoc.proof.verificationMethod).fragment
        )
        if (!method?.id) {
          throw new Error(DID_ERROR_VERIFICATION_METHOD_LOOKUP)
        }

        const res = await jldsign.verify(
          didDoc,
          {
            suite: crypto.buildSignSuite({
              publicKey: key.pubKey,
              privateKey: '',
              id: method.id,
              controller
            }),
            documentLoader: _buildDocumentLoader(didDoc),
            purpose: didDoc.proof.proofPurpose
              ? new jldsign.purposes.ControllerProofPurpose(
                {
                  controller: didDoc,
                  term: didDoc.proof.proofPurpose,
                }
              )
              : new jldsign.purposes.PublicKeyProofPurpose({
                controller: didDoc
              }),
            compactProof: false,
          }
        )
        if (res.verified) {
          return await _verifySubjectSignature(didDoc)
        }
        console.log(res)
      } catch (e) {
        console.log(e)
      }
      return false
    }

    const _parseDIDId: ParseDIDIdMethod = (id) => {
      const [noFragmentId, fragment] = id.split('#')
      const [noQueryId, query] = noFragmentId.split('?')
      const [, method, cleanId, ...others] = noQueryId.split(':')
      const [purpose, keyIdx] = (
        (items) => items && items.length > 0 ? items : [undefined, undefined]
      )(fragment?.split('-', 2))

      return {
        did: noFragmentId || id,
        method,
        id: cleanId,
        query,
        fragment,
        ...(others.length > 0 ? { subjectId: others.join(':') } : {}),
        ...(keyIdx ? {
          purpose,
          keyIdx: parseInt(keyIdx)
        } : {})
      }
    }

    const _producePurposes = (
      params: {
        purposes: DIDDocumentPurpose[],
        key: CommonCryptoKey,
        id: string,
        controller: string,
        keyIdx?: string
      }
    ) => {
      params.keyIdx = params.keyIdx || ''
      return params.purposes.reduce((memo: DIDDocumentPayload, purpose) => {
        if (!params.key.pubKey) {
          throw new Error(COMMON_CRYPTO_ERROR_NOPUBKEY)
        }

        memo[purpose] = [...(purpose !== DIDPURPOSE_VERIFICATION
          ? [
            `${params.id}#${purpose}-${params.keyIdx}`,
          ]
          : [{
            id: `${params.id}#${purpose}-${params.keyIdx}`,
            controller: params.controller,
            type: VERIFICATION_METHOD,
            ..._buildKeyPayload(params.key.pubKey)
          }])]

        return memo
      }, {})
    }

    const _isDIDId = (id: string) => id.split(':').length > 2

    const _makeNonce = async (key: CommonCryptoKey) =>
      `${crypto.base58().encode(await crypto.getRandomBytes(8))
      }${key.nextKeyDigest ? `:${key.nextKeyDigest}` : ''}`

    return {
      makeDIDId: _makeDIDId,

      verifyDID: _verifyDID,

      parseDIDId: _parseDIDId,

      isDIDId: _isDIDId,

      signDID: async (key, didDocUnsigned, purposes) => {
        if (!key.pubKey) {
          throw new Error(COMMON_CRYPTO_ERROR_NOPUBKEY)
        }
        const controller = _makeDIDId(key)

        const nonce = await _makeNonce(key)

        const hasVerificationMethod = didDocUnsigned.hasOwnProperty(DIDPURPOSE_VERIFICATION)

        let verificationIdx = 0
        let publicKeyIdx = 0
        if (hasVerificationMethod) {
          let verifications = <DIDVerificationItem[]>didDocUnsigned[DIDPURPOSE_VERIFICATION]
          if (!Array.isArray(verifications)) {
            verifications = []
          }
          const verification = {
            id: `${didDocUnsigned.id}#${DIDPURPOSE_VERIFICATION}-`,
            controller,
            nonce,
            type: VERIFICATION_METHOD,
            ..._buildKeyPayload(key.pubKey)
          }
          let addVerification = !verifications[0] || controller !== verifications[0].controller
          if (addVerification) {
            if (!verifications[0]) {
              verificationIdx = 1
              verifications[0] = {
                ...verification,
                id: `${verification.id}1`
              }
            } else {
              verificationIdx = verifications.length + 1
              verifications.push({ ...verification, id: `${verification.id}${verificationIdx}` })
            }
          } else if (verifications[0] && controller === verifications[0].controller) {
            verificationIdx = 1
            verifications[0] = <DIDVerificationItem>{
              ...Object.fromEntries(Object.entries(verification).filter(([key]) => {
                return !['@context', 'proof'].includes(key)
              })),
              id: `${verification.id}1`
            }
          }
        }
        if (purposes) {
          const documentPayload = _producePurposes({
            purposes,
            key,
            controller,
            id: didDocUnsigned.id
          })

          didDocUnsigned = didPurposeList.reduce((unsigned, purpose) => {
            if (!documentPayload[purpose]) {
              return unsigned
            }

            const verifications = <(DIDVerificationItem | string)[]>documentPayload[purpose]
            const itemsCount = <number>(didDocUnsigned[purpose]?.length ? didDocUnsigned[purpose]?.length : 0)
            return {
              ...unsigned,
              [purpose]: [
                ...(verifications.reduce(
                  (memo, verification) => {
                    return [
                      ...memo,
                      (typeof verification === 'string'
                        ? `${verification}${itemsCount + 1}`
                        : {
                          ...<DIDVerificationItem>verification,
                          id: `${verification.id}${itemsCount + 1}`
                        })
                    ]
                  },
                  itemsCount ? <(DIDVerificationItem | string)[]>didDocUnsigned[purpose] : []))
              ]
            }
          }, didDocUnsigned)
        }
        const publicKey = {
          id: `${didDocUnsigned.id}#publicKey-`,
          type: VERIFICATION_METHOD,
          ..._buildKeyPayload(key.pubKey)
        }
        if (didDocUnsigned.publicKey) {
          publicKeyIdx = didDocUnsigned.publicKey.length + 1
          if (!didDocUnsigned.publicKey[0] || didDocUnsigned.publicKey[0].id !== `${publicKey.id}1`) {
            didDocUnsigned.publicKey.push({ ...publicKey, id: `${publicKey.id}${publicKeyIdx}` })
          }
        } else {
          publicKeyIdx = 1
          didDocUnsigned.publicKey = [{ ...publicKey, id: `${publicKey.id}1` }]
        }

        const keyId = hasVerificationMethod
          ? `${DIDPURPOSE_VERIFICATION}-${verificationIdx}`
          : `publicKey-${publicKeyIdx}`

        return await jldsign.sign(
          didDocUnsigned,
          {
            suite: await crypto.buildSignSuite({
              publicKey: key.pubKey,
              privateKey: <string>key.pk,
              id: `${didDocUnsigned.id}#${keyId}`,
              controller: controller
            }),
            documentLoader: _buildDocumentLoader(didDocUnsigned),
            purpose: hasVerificationMethod
              ? new jldsign.purposes.ControllerProofPurpose(
                {
                  term: DIDPURPOSE_VERIFICATION,
                  controller: { id: controller }
                },
              )
              : new jldsign.purposes.PublicKeyProofPurpose({
                controller: { id: controller }
              }),
            compactProof: false,
          }
        )
      },

      createDID: async (key, options = {}) => {
        if (!key.pubKey) {
          throw new Error(COMMON_CRYPTO_ERROR_NOPUBKEY)
        }
        const id = _makeDIDId(key, options)

        let purposes = options.purpose || [DIDPURPOSE_VERIFICATION]
        if (!Array.isArray(purposes)) {
          purposes = [purposes]
        }

        const holder = _makeDIDId(key)

        const didDocUnsigned: DIDDocumentUnsinged = {
          '@context': [
            'https://w3id.org/did/v1',
            'https://w3id.org/security/v2'
          ],
          id,
          ..._producePurposes({
            purposes,
            key,
            id,
            controller: holder,
            keyIdx: '1'
          }),
          publicKey: [{
            id: `${id}#publicKey-1`,
            type: VERIFICATION_METHOD,
            ..._buildKeyPayload(key.pubKey)
          }],
        }

        if (didDocUnsigned[DIDPURPOSE_VERIFICATION]) {
          if (didDocUnsigned[DIDPURPOSE_VERIFICATION]?.length === 0) {
            throw new SyntaxError('No verification method, while the section is presented')
          }
          const verifications = <DIDVerificationItem[]>didDocUnsigned[DIDPURPOSE_VERIFICATION]
          if (verifications[0]) {
            verifications[0] = await jldsign.sign(
              {
                '@context': ['https://w3id.org/did/v1', {
                  '@version': 1.1,
                  'xsd': 'https://www.w3.org/2009/XMLSchema/XMLSchema.xsd#',
                  'did': 'https://w3id.org/security/v2',
                  nonce: { '@id': 'did:nonce', '@type': 'xsd:string' },
                  publicKeyBase58: { '@id': 'did:publicKeyBase58', '@type': 'xsd:string' },
                  originalPurposes: { '@type': '@json', '@id': 'did:originalPurposes' },
                  proof: { '@id': 'did:proof' }
                }],
                ...verifications[0],
                nonce: await _makeNonce(key),
                originalPurposes: purposes
              },
              {
                suite: await crypto.buildSignSuite({
                  publicKey: key.pubKey,
                  privateKey: <string>key.pk,
                  id: `${id}#publicKey-1`,
                  controller: holder
                }),

                documentLoader: _buildDocumentLoader(didDocUnsigned),
                purpose: new jldsign.purposes.PublicKeyProofPurpose({
                  controller: { id: holder }
                }),
                compactProof: false,
              }
            )
          }
        }

        return didDocUnsigned
      },

      didToLongForm: async (did) => {
        const compressed = crypto.base58().encode(Buffer.from(
          JSON.stringify(did),
          'utf8'
        ))

        return `${did.id};${didPrefix}:initial-state=${compressed}`
      },

      extractProofController: _extractProofController,

      expandVerificationMethod: _expandVerificationMethod,

      setupDocumentLoader: (loader) => {
        __buildDocumentLoader = loader
      }
    }
  }