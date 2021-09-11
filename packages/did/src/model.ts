import {
  CommonCryptoKey,
  CryptoHelper,
  COMMON_CRYPTO_ERROR_NOPK,
  COMMON_CRYPTO_ERROR_NOPUBKEY,
  COMMON_CRYPTO_ERROR_NOID
} from '@owlmeans/regov-ssi-common'
import { DEFAULT_VERIFICATION_KEY, PUBLICKEY_VERIFICATION, VERIFICATION_KEY_CONTROLLER, VERIFICATION_KEY_HOLDER } from '.'

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
  ExpandVerificationMethod,
  ExtractKeyMethod,
  DID_EXTRACTKEY_WRONG_DID,
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

      return `did:${didPrefix}:${!options.hash
        ? `${key.id}${options.data ? `:${options.data}` : ''}`
        : crypto.makeId(
          key.id,
          options.data && options.hash ? crypto.hash(options.data) : options.data,
          options.expand
        )
        }`
    }

    const _isDIDId = (id: string) => id.split(':').length > 2

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

    const _buildKeyPayload = (key: string) => {
      return { publicKeyBase58: key }
    }

    const _extractKeyId = (key: string): string => {
      return _isDIDId(key) ? _parseDIDId(key).fragment || DEFAULT_VERIFICATION_KEY : key
    }

    const _extractProofController = (did: DIDDocument) => {
      if (!did.proof.verificationMethod) {
        throw new Error(DID_ERROR_VERIFICATION_NO_VERIFICATION_METHOD)
      }
      return _expandVerificationMethod(
        did, DIDPURPOSE_VERIFICATION, did.proof.verificationMethod
      )?.controller || did.id
    }

    const _expandVerificationMethod: ExpandVerificationMethod
      = (didDoc, purpose, keyId = DEFAULT_VERIFICATION_KEY) => {
        if (_isDIDId(keyId)) {
          keyId = _extractKeyId(keyId)
        }

        const methodToExpand = didDoc[purpose]?.find(
          (_method) => {
            const parsedMethod = typeof _method === 'string'
              ? _parseDIDId(_method)
              : _parseDIDId(_method.id)

            return parsedMethod.fragment === keyId
          }
        )

        if (!methodToExpand) {
          throw new Error(DID_ERROR_NOVERIFICATION_METHOD)
        }

        const expandedMethod = typeof methodToExpand === 'string'
          ? didDoc.publicKey.find(publicKey => _parseDIDId(publicKey.id).fragment === keyId)
          : methodToExpand?.publicKeyBase58
            ? methodToExpand
            : didDoc.publicKey.find(publicKey => _parseDIDId(methodToExpand.id).fragment === keyId)

        return expandedMethod === methodToExpand ? methodToExpand
          : {
            ...expandedMethod,
            ...(
              typeof methodToExpand === 'string'
                ? { id: methodToExpand }
                : methodToExpand
            ),
          } as DIDVerificationItem
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
            const expandedVerification =
              !verification.publicKeyBase58
                ? _expandVerificationMethod(didDoc, DIDPURPOSE_VERIFICATION, verification.id)
                : verification

            if (!expandedVerification.publicKeyBase58) {
              throw new Error(DID_ERROR_VERIFICATION_METHOD_AMBIGUOUS)
            }

            const res = await jldsign.verify(
              verification,
              {
                suite: crypto.buildSignSuite({
                  publicKey: expandedVerification.publicKeyBase58,
                  privateKey: '',
                  id: verification.proof.verificationMethod,
                  controller: verification.controller
                }),
                documentLoader: _buildDocumentLoader(didDoc),
                purpose: new jldsign.purposes.PublicKeyProofPurpose({
                  controller: didDoc
                }),
                compactProof: false,
              }
            )
            if (res.verified) {
              return verification.originalPurposes ? !verification.originalPurposes.some(
                (originalPurpose) => {
                  try {
                    _expandVerificationMethod(
                      didDoc,
                      originalPurpose,
                      verification.id
                    )
                  } catch (e) {
                    return true
                  }

                  return false
                }
              ) : true
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

    const _producePurposes = (
      purposes: DIDDocumentPurpose[],
      params: {
        id: string,
        controller: string,
        keyId?: string
      }
    ): DIDDocumentPayload => {
      params.keyId = params.keyId || DEFAULT_VERIFICATION_KEY
      return purposes.reduce((payload: DIDDocumentPayload, purpose) => {

        return {
          ...payload, [purpose]: [...(purpose !== DIDPURPOSE_VERIFICATION
            ? [
              `${params.id}#${params.keyId}`,
            ]
            : [{
              id: `${params.id}#${params.keyId}`,
              controller: params.controller,
              type: VERIFICATION_METHOD,
            }])]
        }
      }, {})
    }

    const _extractKey: ExtractKeyMethod = async (did, keyId) => {
      if (typeof did === 'string') {
        throw new Error(DID_EXTRACTKEY_WRONG_DID)
      }
      if (!keyId) {
        keyId = _extractKeyId(did.proof.verificationMethod)
      }

      const method = did.publicKey.find(
        publicKey => _extractKeyId(publicKey.id) === keyId
      )

      if (!method) {
        return undefined
      }

      const verificationMethod = did.verificationMethod?.find(
        _method => _extractKeyId(_method.id) === keyId 
      )

      return {
        id: method.id,
        pubKey: method.publicKeyBase58,
        nextKeyDigest: (nonce => nonce && nonce.length > 1 ? nonce[1] : undefined)
          (verificationMethod?.nonce?.split(':', 2)),
        fragment: keyId
      }
    }

    const _makeNonce = async (key: CommonCryptoKey) =>
      `${crypto.base58().encode(await crypto.getRandomBytes(8))
      }${key.nextKeyDigest ? `:${key.nextKeyDigest}` : ''}`

    return {
      makeDIDId: _makeDIDId,

      isDIDId: _isDIDId,

      parseDIDId: _parseDIDId,

      createDID: async (key, options = {}) => {
        if (!key.pubKey) {
          throw new Error(COMMON_CRYPTO_ERROR_NOPUBKEY)
        }
        if (!key.pk) {
          throw new Error(COMMON_CRYPTO_ERROR_NOPK)
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
          ..._producePurposes(purposes, {
            id,
            controller: holder,
            keyId: VERIFICATION_KEY_HOLDER
          }),
          publicKey: [{
            id: `${id}#${VERIFICATION_KEY_HOLDER}`,
            type: VERIFICATION_METHOD,
            ..._buildKeyPayload(key.pubKey)
          }],
        }

        if (didDocUnsigned[DIDPURPOSE_VERIFICATION]) {
          const verifications = <[DIDVerificationItem]>didDocUnsigned[DIDPURPOSE_VERIFICATION]
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
                privateKey: key.pk,
                id: `${id}#${VERIFICATION_KEY_HOLDER}`,
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

        return didDocUnsigned
      },

      signDID: async (key, didDocUnsigned, keyId = VERIFICATION_KEY_HOLDER, purposes?) => {
        if (!key.pubKey) {
          throw new Error(COMMON_CRYPTO_ERROR_NOPUBKEY)
        }
        if (!key.pk) {
          throw new Error(COMMON_CRYPTO_ERROR_NOPK)
        }
        const controller = _makeDIDId(key)
        const nonce = await _makeNonce(key)

        if (purposes) {
          Object.entries(_producePurposes(purposes, {
            controller,
            id: didDocUnsigned.id,
            keyId
          })).map(([key, methods]) => {
            didDocUnsigned[key as DIDDocumentPurpose] =
              [
                ...(didDocUnsigned[key as DIDDocumentPurpose] || []),
                ...methods
              ] as DIDVerificationItem[]
          })
        }

        const hasVerificationMethod = purposes?.includes(DIDPURPOSE_VERIFICATION)
          || didDocUnsigned.hasOwnProperty(DIDPURPOSE_VERIFICATION)

        if (hasVerificationMethod) {
          const verification = {
            id: `${didDocUnsigned.id}#${keyId}`,
            controller,
            nonce,
            type: VERIFICATION_METHOD,
          }

          didDocUnsigned.verificationMethod = didDocUnsigned.verificationMethod || []
          const verifications = <DIDVerificationItem[]>didDocUnsigned[DIDPURPOSE_VERIFICATION]
          const sameVerificationIdx = verifications.findIndex(
            _verification => _verification.id === verification.id
          )
          if (-1 === sameVerificationIdx) {
            verifications.push(verification)
          } else {
            verifications[sameVerificationIdx] = verification
          }
        }

        if (keyId !== VERIFICATION_KEY_HOLDER) {
          didDocUnsigned.publicKey.push({
            id: `${didDocUnsigned.id}#${keyId}`,
            type: VERIFICATION_METHOD,
            ..._buildKeyPayload(key.pubKey)
          })
        }

        return await jldsign.sign(
          didDocUnsigned,
          {
            suite: await crypto.buildSignSuite({
              publicKey: key.pubKey,
              privateKey: key.pk,
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

      verifyDID: async (didDoc: DIDDocument) => {
        if (!didDoc.proof?.verificationMethod) {
          console.log('No proof or verification method')
          return false
        }

        const key = await _extractKey(didDoc)

        if (!key?.pubKey) {
          throw new Error(COMMON_CRYPTO_ERROR_NOPUBKEY)
        }
        if (!key.id) {
          throw new Error(COMMON_CRYPTO_ERROR_NOID)
        }

        try {
          const res = await jldsign.verify(
            didDoc,
            {
              suite: crypto.buildSignSuite({
                publicKey: key.pubKey,
                privateKey: '',
                id: key.id,
                controller: _extractProofController(didDoc)
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
      },

      expandVerificationMethod: _expandVerificationMethod,

      extractProofController: _extractProofController,

      didToLongForm: async (did) => {
        const compressed = crypto.base58().encode(Buffer.from(
          JSON.stringify(did),
          'utf8'
        ))

        return `${did.id};${didPrefix}:state=${compressed}`
      },

      extractKey: _extractKey,

      extractKeyId: _extractKeyId,

      setupDocumentLoader: (loader) => {
        __buildDocumentLoader = loader
      }
    }
  }