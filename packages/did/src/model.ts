import {
  CryptoKey,
  CryptoHelper,
  simplifyValue,
  extractId,
  Idish,
  COMMON_CRYPTO_ERROR_NOPK,
  COMMON_CRYPTO_ERROR_NOPUBKEY,
  COMMON_CRYPTO_ERROR_NOID,
  normalizeValue,
  addToValue
} from '@owlmeans/regov-ssi-common'
import { URLSearchParams } from 'url'
import {
  QueryDict,
  DEFAULT_VERIFICATION_KEY,
  VERIFICATION_KEY_HOLDER,
  DIDDocumentSimplePurpose,
} from './types'

import {
  DIDDocument,
  DIDPURPOSE_VERIFICATION,
  DIDHelper,
  DEFAULT_APP_SCHEMA_URL,
  DEFAULT_DID_PREFIX,
  DEFAULT_DID_SCHEMA_PATH,
  MakeDIDIdOptions,
  BuildDIDHelperOptions,
  DIDDocumentPayload,
  DID_ERROR_NOVERIFICATION_METHOD,
  DIDDocumentUnsinged,
  DIDDocumentPurpose,
  DIDVerificationItem,
  ParseDIDIdMethod,
  DID_ERROR_VERIFICATION_NO_VERIFICATION_METHOD,
  BuildDocumentLoader,
  ExpandVerificationMethod,
  ExtractKeyMethod,
  DID_EXTRACTKEY_WRONG_DID,
} from './types'

import { documentWarmer } from './loader'

const jldsign = require('jsonld-signatures')

const VERIFICATION_METHOD = 'EcdsaSecp256k1VerificationKey2019'
// const SIGNATURE_METHOD = 'EcdsaSecp256k1Signature2019'

/**
 * @TODO Verify DID fully:
 * 1. Verify that ids produces correctly
 */
export const buildDidHelper =
  (
    crypto: CryptoHelper, 
    buildOptions: BuildDIDHelperOptions = {
      prefix: DEFAULT_DID_PREFIX,
      schemaPath: DEFAULT_DID_SCHEMA_PATH,
      baseSchemaUrl: DEFAULT_APP_SCHEMA_URL
    }
  ): DIDHelper => {
    let __buildDocumentLoader: BuildDocumentLoader | undefined

    const _buildDocumentLoader = (didDoc: DIDDocument | DIDDocumentUnsinged) => {
      return __buildDocumentLoader && __buildDocumentLoader(() => didDoc)
    }

    const baseSchemaUrl = /* options.baseSchemaUrl ||*/ buildOptions.baseSchemaUrl || DEFAULT_APP_SCHEMA_URL
    const contextUrl = `${baseSchemaUrl}${buildOptions.schemaPath ? `/${buildOptions.schemaPath}` : ''}#`
    const context = JSON.stringify({
      '@context': {
        '@version': 1.1,
        didx: contextUrl,
        xsd: 'http://www.w3.org/2001/XMLSchema#',
        nonce: { '@id': 'didx:nonce', '@type': 'xsd:string' },
        publicKeyBase58: { '@id': 'didx:publicKeyBase58', '@type': 'xsd:string' }
      }
    })

    documentWarmer(contextUrl, context)

    const _makeDIDId = (key: CryptoKey, options: MakeDIDIdOptions = {}) => {
      if (!key.id) {
        throw new Error(COMMON_CRYPTO_ERROR_NOID)
      }

      return `did:${buildOptions.prefix}:${!options.hash
        ? `${key.id}${options.data ? `:${options.data}` : ''}`
        : crypto.makeId(
          key.id,
          options.data && options.hash ? crypto.hash(options.data) : options.data,
          options.expand
        )
        }${key.fragment ? `#${key.fragment}` : ''}${options.query
          ? Object.entries(options.query).reduce((query, [key, value]) => {
            return `${query === '?' ? query : `${query}&`}${Array.isArray(value)
              ? value.reduce((query, value) => {
                return `${query === '' ? '' : '&'}${key}[]=${value}`
              }, '')
              : `${key}=${value}`
              }`
          }, '?')
          : ''
        }`
    }

    const _isDIDId = (id: Idish) => extractId(id).split(':').length > 2

    const _parseDIDId: ParseDIDIdMethod = (id) => {
      id = extractId(id)
      const [noQueryId, query] = id.split('?')
      const queryParams = query ? Array.from(new URLSearchParams(query).entries()).reduce<QueryDict>(
        (query: QueryDict, [key, value]: [string, string | string[] | undefined]) => {
          return { ...query, [key]: value }
        }, {}
      ) : {} as QueryDict
      const [noFragmentId, fragment] = noQueryId.split('#')
      const [, method, cleanId, ...others] = noFragmentId.split(':')
      const [purpose, keyIdx] = (
        (items) => items && items.length > 0 ? items : [undefined, undefined]
      )(fragment?.split('-', 2))

      return {
        did: noFragmentId || id,
        method,
        id: cleanId,
        query: queryParams,
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

    const _extractKeyId = (key: Idish): string => {
      return _isDIDId(key)
        ? _parseDIDId(key).fragment || DEFAULT_VERIFICATION_KEY
        : typeof key === 'string' ? key : DEFAULT_VERIFICATION_KEY
    }

    const _extractProofController = (did: DIDDocument, keyId?: string) => {
      if (!did.proof.verificationMethod) {
        throw new Error(DID_ERROR_VERIFICATION_NO_VERIFICATION_METHOD)
      }
      return _expandVerificationMethod(
        did, DIDPURPOSE_VERIFICATION, keyId || did.proof.verificationMethod
      )?.controller || did.id
    }

    const _expandVerificationMethod: ExpandVerificationMethod
      = (didDoc, purpose, keyId = DEFAULT_VERIFICATION_KEY) => {
        if (_isDIDId(keyId)) {
          keyId = _extractKeyId(keyId)
        }

        const methodToExpand = normalizeValue(didDoc[purpose]).find(
          (_method) => {
            if (!_method) {
              return false
            }
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
          ? normalizeValue(didDoc.verificationMethod).find(
            _method => _method && _parseDIDId(_method).fragment === keyId
          )
          : methodToExpand?.publicKeyBase58
            ? methodToExpand
            : normalizeValue(didDoc.verificationMethod).find(
              _method => _method && _parseDIDId(_method).fragment === keyId
            )

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

    const _producePurposes = (
      purposes: DIDDocumentPurpose[],
      params: {
        id: string,
        controller: string,
        keyId?: string,
        publicKeyBase58?: string
      }
    ): DIDDocumentPayload => {
      params.keyId = params.keyId || DEFAULT_VERIFICATION_KEY
      return purposes.reduce((payload: DIDDocumentPayload, purpose) => {

        return {
          ...payload, [purpose]: purpose !== DIDPURPOSE_VERIFICATION
            ? `${params.id}#${params.keyId}`
            : {
              id: `${params.id}#${params.keyId}`,
              controller: params.controller,
              type: VERIFICATION_METHOD,
              ...(params.publicKeyBase58 ? { publicKeyBase58: params.publicKeyBase58 } : {})
            }
        }
      }, {})
    }

    const _isDIDUnsigned = (obj: Object): obj is DIDDocumentUnsinged => {
      return !obj.hasOwnProperty('proof') && obj.hasOwnProperty('id')
    }

    const _isDIDSigned = (obj: DIDDocument | DIDDocumentUnsinged): obj is DIDDocument => {
      return obj.hasOwnProperty('proof')
    }

    const _extractKey: ExtractKeyMethod = async (did, keyId) => {
      if (typeof did === 'string') {
        throw new Error(DID_EXTRACTKEY_WRONG_DID)
      }
      if (!keyId) {
        keyId = _isDIDSigned(did) ? _extractKeyId(did.proof.verificationMethod) : VERIFICATION_KEY_HOLDER
      }

      const method = normalizeValue(did.verificationMethod).find(
        _method => _method && _extractKeyId(_method) === keyId
      )

      if (!method) {
        return undefined
      }

      const verificationMethod = normalizeValue(did.verificationMethod).find(
        _method => _method && _extractKeyId(_method) === keyId
      )

      return {
        id: method.id,
        pubKey: method.publicKeyBase58,
        nextKeyDigest: (nonce => nonce && nonce.length > 1 ? nonce[1] : undefined)
          (verificationMethod?.nonce?.split(':', 2)),
        fragment: keyId
      }
    }

    const _cutProof = (doc: DIDDocument | DIDDocumentUnsinged): DIDDocumentUnsinged => {
      return Object.entries(doc).reduce((doc, [key, value]) => {
        return { ...doc, ...(key === 'proof' ? {} : { [key]: value }) }
      }, {} as DIDDocumentUnsinged)
    }

    const _isDIDDocument = (obj: Object): obj is DIDDocument => {
      return obj.hasOwnProperty('id')
        && obj.hasOwnProperty(DIDPURPOSE_VERIFICATION)
        && obj.hasOwnProperty('@context')
        && obj.hasOwnProperty('proof')
    }

    const _makeNonce = async (key: CryptoKey) =>
      `${crypto.base58().encode(await crypto.getRandomBytes(8))
      }${key.nextKeyDigest ? `:${key.nextKeyDigest}` : ''}`

    const _helper: DIDHelper = {
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
        const keyId = options.keyId || VERIFICATION_KEY_HOLDER

        let didDocUnsigned: DIDDocumentUnsinged = options.source
          ? {
            ..._cutProof(options.source),
          }
          : {
            '@context': [
              'https://w3id.org/did/v1',
              contextUrl
            ],
            id
          }

        didDocUnsigned = {
          ...didDocUnsigned,
          ..._producePurposes(purposes, {
            id,
            controller: holder,
            keyId,
            ..._buildKeyPayload(key.pubKey)
          })
        }

        const nonce = await _makeNonce(key)

        normalizeValue(didDocUnsigned.verificationMethod).forEach(
          method => typeof method === 'object' && (method.nonce = nonce)
        )

        if (options.alsoKnownAs) {
          didDocUnsigned.alsoKnownAs = options.alsoKnownAs
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
            didDocUnsigned[key as DIDDocumentPurpose] = addToValue(
              didDocUnsigned[key as DIDDocumentPurpose], methods
            ) as any /** @TODO Fix this any - ti's really hard */
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
            ..._buildKeyPayload(key.pubKey)
          }
          
          const existedVerificationIdx = normalizeValue(didDocUnsigned.verificationMethod).findIndex(
            _method => _method && _method.id === verification.id
          )
          if (existedVerificationIdx > -1) {
            if (Array.isArray(didDocUnsigned.verificationMethod)) {
              didDocUnsigned.verificationMethod[existedVerificationIdx] = verification
            } else {
              didDocUnsigned.verificationMethod = verification
            }
          } else {
            didDocUnsigned.verificationMethod = addToValue(
              didDocUnsigned.verificationMethod, verification
            )
          }
        }

        return await jldsign.sign(
          _cutProof(didDocUnsigned),
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

          if (!res.verified) {
            console.log(res)
          }

          return res.verified
        } catch (e) {
          console.error(e)
        }
        return false
      },

      delegate: async (key, source, delegatee, purposes?) => {
        const delegatedUnsigned = await _helper.createDID(
          key,
          {
            id: _helper.makeDIDId(key, {
              hash: true,
              data: JSON.stringify({
                id: source.id,
                delegatee: delegatee
              })
            }),
            alsoKnownAs: addToValue(source.alsoKnownAs, source.id),
            purpose: purposes
          }
        )

        return _helper.signDID(key, delegatedUnsigned)
      },

      expandVerificationMethod: _expandVerificationMethod,

      extractProofController: _extractProofController,

      didToLongForm: async (did) => {
        const compressed = crypto.base58().encode(Buffer.from(
          JSON.stringify(did),
          'utf8'
        ))

        return `${did.id};${buildOptions.prefix}:state=${compressed}`
      },

      extractKey: _extractKey,

      extractKeyId: _extractKeyId,

      isDIDDocument: _isDIDDocument,

      isDIDUnsigned: _isDIDUnsigned,

      setupDocumentLoader: (loader) => {
        __buildDocumentLoader = loader
      }
    }

    return _helper
  }