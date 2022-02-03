import { isCredential } from "@owlmeans/regov-ssi-core"
import {
  DIDDocument,
  DIDDocumentUnsinged,
  VERIFICATION_KEY_HOLDER
} from "@owlmeans/regov-ssi-did"
import {
  ClaimingFactoryMethodBuilder
} from "../types"


export const defaultClaimingFactory: ClaimingFactoryMethodBuilder = schema =>
  async (wallet, params) => {
    const unsigned = params.unsignedClaim
    const unsignedDid = unsigned.holder as DIDDocumentUnsinged
    const signerKey = await wallet.ssi.did.helper().extractKey(unsignedDid, VERIFICATION_KEY_HOLDER)
    if (!signerKey) {
      throw new Error('claimer.holder.key')
    }
    await wallet.ssi.keys.expandKey(signerKey)
    if (!signerKey.pk) {
      throw new Error('claimer.holder.pk')
    }
    const issuer = await wallet.ssi.did.helper().signDID(signerKey, unsignedDid)
    unsigned.holder = { id: issuer.id }
    if (schema.claimType) {
      unsigned.type.push(schema.claimType)
    }

    const cred = await wallet.ssi.signCredential(unsigned, issuer, { keyId: VERIFICATION_KEY_HOLDER })

    let holder: DIDDocument | Credential = params.holder || (cred.issuer as unknown as DIDDocument)

    if (isCredential(holder)) {
      if (typeof holder.issuer === 'string') {
        throw new Error('claimer.holder.format')
      }
      holder = holder.issuer
    }

    if (!wallet.ssi.did.helper().isDIDDocument(holder)) {
      throw new Error('claimer.holder.format')
    }

    const helper = wallet.did.helper()

    const unsignedClaim = await wallet.ssi.buildPresentation([cred], {
      holder, type: schema.claimType,
      id: helper.parseDIDId(
        helper.makeDIDId(signerKey, { data: JSON.stringify([cred]), hash: true })
      ).did
    })
    return wallet.ssi.signPresentation(unsignedClaim, holder)
  }