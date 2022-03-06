import { addToValue } from "../../../common"
import { isCredential } from "../../../vc"
import { DIDDocument, DIDDocumentUnsinged, VERIFICATION_KEY_HOLDER } from "../../../did"
import { RequestMethodBuilder } from "../types"
import { ERROR_FACTORY_NO_IDENTITY } from "./types"


export const defaultRequestMethod: RequestMethodBuilder = schema =>
  async (wallet, params) => {
    const unsigned = params.unsignedRequest

    const identity = params.identity || wallet.getIdentity()?.credential
    if (!identity) {
      throw ERROR_FACTORY_NO_IDENTITY
    }
    unsigned.evidence = addToValue(unsigned.evidence, identity)

    const unsignedDid = unsigned.holder as DIDDocumentUnsinged
    const signerKey = await wallet.ssi.did.helper().extractKey(unsignedDid, VERIFICATION_KEY_HOLDER)
    if (!signerKey) {
      throw new Error('request.holder.key')
    }
    await wallet.ssi.keys.expandKey(signerKey)
    if (!signerKey.pk) {
      throw new Error('request.holder.pk')
    }
    const issuer = await wallet.ssi.did.helper().signDID(signerKey, unsignedDid)
    unsigned.holder = { id: issuer.id }
    if (schema.requestType) {
      unsigned.type.push(schema.requestType)
    }

    const cred = await wallet.ssi.signCredential(unsigned, issuer, { keyId: VERIFICATION_KEY_HOLDER })

    let holder: DIDDocument | Credential = params.holder || (cred.issuer as unknown as DIDDocument)

    if (isCredential(holder)) {
      if (typeof holder.issuer === 'string') {
        throw new Error('request.holder.format')
      }
      holder = holder.issuer
    }

    if (!wallet.ssi.did.helper().isDIDDocument(holder)) {
      throw new Error('request.holder.format')
    }

    const helper = wallet.did.helper()

    const unsignedRequest = await wallet.ssi.buildPresentation([cred], {
      holder, type: schema.requestType,
      id: helper.parseDIDId(
        helper.makeDIDId(signerKey, { data: JSON.stringify([cred]), hash: true })
      ).did
    })

    return wallet.ssi.signPresentation(unsignedRequest, holder)
  }