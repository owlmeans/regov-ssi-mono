import {
  addToValue,
  CryptoKey,
  normalizeValue
} from "@owlmeans/regov-ssi-common"
import {
  isCredential
} from "@owlmeans/regov-ssi-core"
import {
  DIDDocument,
  DIDDocumentUnsinged, ExtractKeyMethod, VERIFICATION_KEY_CONTROLLER, VERIFICATION_KEY_HOLDER
} from "@owlmeans/regov-ssi-did"
import { SigningFactoryMethodBuilder } from "../types"
import {
  ERROR_FACTORY_EVIDENCE_HOLDER_FORMAT,
  ERROR_FACTORY_SIGNING_KEY_ISNT_RETRIVED
} from "./types"


export const defaultSigningFactory: SigningFactoryMethodBuilder = schema =>
  async (wallet, params) => {
    const unsigned = params.unsigned
    const unsignedDid = unsigned.holder as DIDDocumentUnsinged
    let issuer: DIDDocument | undefined = undefined

    if (params.evidence) {
      let signerKey: CryptoKey | undefined = undefined
      await Promise.all(normalizeValue(params.evidence).map(async evidence => {
        if (!isCredential(evidence)) {
          throw ERROR_FACTORY_EVIDENCE_HOLDER_FORMAT
        }

        const signer = wallet.did.helper().isDIDDocument(evidence.holder)
          ? evidence.holder as DIDDocument
          : evidence.issuer

        if (!wallet.did.helper().isDIDDocument(signer)) {
          return
        }

        if (!normalizeValue(unsigned.evidence).find(evidence => evidence?.id === evidence?.id)) {
          unsigned.evidence = addToValue(unsigned.evidence, evidence)
        }

        const evidenceInfo = normalizeValue(schema.evidence).find(
          _evidence => _evidence && evidence.type.includes(_evidence.type)
        )
        if (evidenceInfo?.signing) {
          signerKey = await wallet.ssi.did.helper().extractKey(signer, VERIFICATION_KEY_HOLDER)
          if (!signerKey) {
            throw new Error('evidence.holder.key')
          }
          await wallet.ssi.keys.expandKey(signerKey)
          if (!signerKey.pk) {
            throw new Error('evidence.holder.pk')
          }
          if (!signer || typeof signer === 'string') {
            throw new Error('evidence.signer.type')
          }
          issuer = signer
        }
      }))
      if (!signerKey) {
        throw ERROR_FACTORY_SIGNING_KEY_ISNT_RETRIVED
      }
      unsigned.holder = await wallet.ssi.did.helper().signDID(
        signerKey, unsignedDid, VERIFICATION_KEY_CONTROLLER
      )
    } else {
      const signerKey = await wallet.ssi.did.helper().extractKey(unsignedDid, VERIFICATION_KEY_HOLDER)
      if (!signerKey) {
        throw new Error('evidence.holder.key')
      }
      await wallet.ssi.keys.expandKey(signerKey)
      if (!signerKey.pk) {
        throw new Error('evidence.holder.pk')
      }
      issuer = await wallet.ssi.did.helper().signDID(signerKey, unsignedDid)
      unsigned.holder = { id: issuer.id }
    }

    return await wallet.ssi.signCredential(unsigned, issuer, { keyId: VERIFICATION_KEY_HOLDER })
  }