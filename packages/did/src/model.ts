import {
  CommonCryptoKey,
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
  DIDDocumentPayload,
  DID_ERROR_NOVERIFICATION_METHOD,
  DIDDocumentUnsinged,
  DIDIDExplained,
  DID_ERROR_VERIFICATION_METHOD_AMBIGUOUS,
  DIDDocumentPurpose,
  DIDVerificationItem,
  didPurposeList,
  DIDVerificationMethod
} from './types'

export const buildDidHelper =
  (crypto: CryptoHelper, didPrefix = DEFAULT_DID_PREFIX): DIDHelper => {
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

    const _unsingDoc = (did: any): DIDDocumentUnsinged => {
      const newDoc = JSON.parse(JSON.stringify(did))
      delete newDoc.proof

      return newDoc
    }

    const _didDocToSigningSuffix = (didDoc: DIDDocumentUnsinged | DIDDocumnet): string => {
      let unsingedDoc: DIDDocumentUnsinged = didDoc
      if (unsingedDoc.hasOwnProperty('proof')) {
        unsingedDoc = _unsingDoc(unsingedDoc)
      }

      return crypto.hash(JSON.stringify(unsingedDoc))
    }

    const _makeDIDProofSignature = (key: CommonCryptoKey, id: string, nonce: string, date: string, didDoc: DIDDocumentUnsinged) => {
      if (!key.pk) {
        throw new Error(COMMON_CRYPTO_ERROR_NOPK)
      }
      
      return crypto.sign(`${date}:${nonce}:${_didDocToSigningSuffix(didDoc)}:${id}`, key.pk)
    }

    /**
     * @TODO Implement clean up of extra proofs in the verification cycle
     * Right now the controller can't add it's own methods, otherwithe subject
     * verification will fail.
     */
    const _verifySubjectSignature = (didDoc: DIDDocumnet): boolean => {
      if (!didDoc.verificationMethod) {
        return true
      }

      const newDidDoc = _unsingDoc(didDoc)

      if (newDidDoc.verificationMethod) {
        const controllerVerification = newDidDoc.verificationMethod?.findIndex(
          verification => didDoc.proof.verificationMethod === (
            typeof verification === 'string' ? verification : verification.id
          )
        )
        if (controllerVerification !== undefined && controllerVerification > -1) {
          newDidDoc.verificationMethod.splice(controllerVerification, 1)
        }

        const pkIdx = newDidDoc.publicKey.findIndex(pubkey => {
          const parsedPubKey = _parseDIDId(pubkey.id)
          return parsedPubKey.did === didDoc.proof.controller
        })
        if (typeof pkIdx === 'number' && pkIdx > -1) {
          newDidDoc.publicKey.splice(pkIdx, 1)
        }
      }

      return -1 === didDoc.verificationMethod.filter((verification) => {
        if (typeof verification === 'object') {
          if (verification.subjectSignature) {
            return true
          }
        }
      }).sort((verA, verB) => {
        const [verAExplained, verBExplained] = [verA, verB].map(
          ver => _parseDIDId(typeof ver === 'object' ? <string>ver.id : ver)
        ).map(ver => {
          if (ver.fragment) {
            const [, idx] = ver.fragment.split('-')
            if (!idx) {
              return 0
            }
            return parseInt(idx)
          }
          return 0
        })

        return verBExplained - verAExplained
      }).map(verification => {
        const idx = newDidDoc.verificationMethod?.findIndex(
          _verification => typeof _verification === 'string'
            || typeof verification === 'string'
            ? _verification === verification
            : _verification.id === verification.id
        )
        if (newDidDoc.verificationMethod && idx !== undefined && idx > -1) {
          newDidDoc.verificationMethod[idx] = typeof verification === 'string'
            ? verification
            : {
              id: verification.id,
              controller: verification.controller,
              type: 'EcdsaSecp256k1VerificationKey2019',
              publicKeyBase58: verification.publicKeyBase58
            }
          if (typeof verification !== 'object' || !verification.subjectSignature) {
            return true
          }

          const subjectSignature = verification.subjectSignature
          if (!newDidDoc.verificationMethod) {
            return false
          }
          const method = newDidDoc.verificationMethod.find(
            method =>
              typeof method === 'object' ? subjectSignature.controller === method.controller : false
          )
          if (!method || typeof method === 'string') {
            return false
          }

          return crypto.verify(
            subjectSignature.signature,
            `${subjectSignature.created}:${subjectSignature.nonce}:${_didDocToSigningSuffix(newDidDoc)}:${newDidDoc.id}`,
            method.publicKeyBase58
          )
        }
      }).findIndex(result => !result)
    }

    const _verifyDIDProofSignature = (didDoc: DIDDocumnet, key?: CommonCryptoKey) => {
      if (!key?.pubKey) {
        if (!didDoc.proof.verificationMethod) {
          throw new Error(DID_ERROR_NOVERIFICATION_METHOD)
        }
        const proofDid = _parseDIDId(didDoc.proof.verificationMethod)
        if (!proofDid.fragment) {
          throw new Error(DID_ERROR_VERIFICATION_METHOD_AMBIGUOUS)
        }

        const [source]: DIDDocumentPurpose[] = <DIDDocumentPurpose[]>proofDid.fragment.split('-')
        if (!didDoc[source]) {
          throw new Error(DID_ERROR_NOVERIFICATION_METHOD)
        }
        const method = <DIDVerificationItem>didDoc[source]?.find(
          method => {
            if (typeof method === 'string') {
              return false
            }

            return method.id === didDoc.proof.verificationMethod
          }
        )

        if (method?.publicKeyBase58) {
          key = {
            pubKey: method.publicKeyBase58
          }
        }
      }

      if (!key?.pubKey) {
        throw new Error(COMMON_CRYPTO_ERROR_NOPUBKEY)
      }

      return _verifySubjectSignature(didDoc) && crypto.verify(
        didDoc.proof.signature,
        `${didDoc.proof.created}:${didDoc.proof.nonce}:${_didDocToSigningSuffix(didDoc)}:${didDoc.id}`,
        key.pubKey
      )
    }

    const _parseDIDId = (id: string): DIDIDExplained => {
      const [noFragmentId, fragment] = id.split('#')
      const [noQueryId, query] = noFragmentId.split('?')
      const [, method, cleanId, ...others] = noQueryId.split(':')

      return {
        did: noFragmentId || id,
        method,
        id: cleanId,
        query,
        fragment,
        ...(others.length > 0 ? { subjectId: others.join(':') } : {})
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

        memo[purpose] = [purpose !== DIDPURPOSE_VERIFICATION
          ? `${params.controller}#publicKey-${params.keyIdx}`
          : {
            id: `${params.id}#${purpose}-${params.keyIdx}`,
            controller: params.controller,
            type: 'EcdsaSecp256k1VerificationKey2019',
            publicKeyBase58: params.key.pubKey
          }]

        return memo
      }, {})
    }

    const _makeNonce = async (key: CommonCryptoKey) =>
      `${crypto.base58().encode(await crypto.getRandomBytes(8))
      }${key.nextKeyDigest ? `:${key.nextKeyDigest}` : ''}`

    return {
      makeDIDId: _makeDIDId,

      makeDIDProofSignature: _makeDIDProofSignature,

      verifyDID: _verifyDIDProofSignature,

      parseDIDId: _parseDIDId,

      isDIDId: (id: string) => id.split(':').length > 2,

      signDID: async (key, didDocUnsigned, purposes) => {
        if (!key.pubKey) {
          throw new Error(COMMON_CRYPTO_ERROR_NOPUBKEY)
        }
        const controller = _makeDIDId(key)

        const nonce = await _makeNonce(key)

        const hasVerificationMethod = didDocUnsigned.hasOwnProperty(DIDPURPOSE_VERIFICATION)

        let verificationIdx = 0
        let publickKeyIdx = 0
        if (hasVerificationMethod) {
          let verifications = (<DIDVerificationItem[]>didDocUnsigned[DIDPURPOSE_VERIFICATION])
          if (!Array.isArray(verifications)) {
            verifications = []
          }
          const verification = {
            id: `${didDocUnsigned.id}#${DIDPURPOSE_VERIFICATION}-`,
            controller,
            type: 'EcdsaSecp256k1VerificationKey2019',
            publicKeyBase58: key.pubKey
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
            verifications[0] = {
              ...verification,
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
          id: `${controller}#publicKey-`,
          type: 'EcdsaSecp256k1VerificationKey2019',
          publicKeyBase58: key.pubKey
        }
        if (didDocUnsigned.publicKey) {
          publickKeyIdx = didDocUnsigned.publicKey.length + 1
          if (!didDocUnsigned.publicKey[0] || didDocUnsigned.publicKey[0].id !== `${publicKey.id}1`) {
            didDocUnsigned.publicKey.push({ ...publicKey, id: `${publicKey.id}${publickKeyIdx}` })
          }
        } else {
          publickKeyIdx = 1
          didDocUnsigned.publicKey = [{ ...publicKey, id: `${publicKey.id}1` }]
        }

        const signatureDate = new Date().toISOString()
        const didDoc: DIDDocumnet = {
          ...didDocUnsigned, proof: {
            type: 'EcdsaSecp256k1Signature2019',
            controller,
            nonce,
            created: signatureDate,
            signature: _makeDIDProofSignature(
              key,
              didDocUnsigned.id,
              nonce,
              signatureDate,
              didDocUnsigned
            ),
            verificationMethod: hasVerificationMethod
              ? `${didDocUnsigned.id}#${DIDPURPOSE_VERIFICATION}-${verificationIdx}`
              : `${controller}#publicKey-${publickKeyIdx}`
          }
        }

        return {
          ...didDoc,
          proof: didDoc.proof
        }
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
            id: `${holder}#publicKey-1`,
            type: 'EcdsaSecp256k1VerificationKey2019',
            publicKeyBase58: key.pubKey
          }],
        }

        if (didDocUnsigned[DIDPURPOSE_VERIFICATION]) {
          const verification = (<DIDVerificationItem[]>didDocUnsigned[DIDPURPOSE_VERIFICATION])[0]
          if (verification) {
            const nonce = await _makeNonce(key)
            const signatureDate = new Date().toISOString()
            verification.subjectSignature = {
              controller: holder,
              type: 'EcdsaSecp256k1Signature2019',
              nonce,
              created: signatureDate,
              originalPurposes: purposes,
              signature: _makeDIDProofSignature(key, id, nonce, signatureDate, didDocUnsigned)
            }
          }
        }

        return didDocUnsigned
      }
    }
  }