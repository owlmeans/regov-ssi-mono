import { 
  DIDDocument, DIDPURPOSE_ASSERTION, DIDPURPOSE_AUTHENTICATION, DIDPURPOSE_VERIFICATION 
} from "../../../did"
import { RespondMethodBuilder } from "../types"
import { ERROR_FACTORY_NO_IDENTITY } from "./types"


export const defaultRespondMethod: RespondMethodBuilder = schema =>
  async (wallet, params) => {
    const identity = params.identity || wallet.getIdentity()?.credential
    if (!identity) {
      throw ERROR_FACTORY_NO_IDENTITY
    }

    let did = params.identity
      ? wallet.did.helper().isDIDDocument(params.identity.holder)
        ? params.identity.holder
        : params.identity.issuer as unknown as DIDDocument
      : wallet.did.helper().isDIDDocument(params.credential.holder)
        ? params.credential.holder
        : params.credential.issuer as unknown as DIDDocument

    if (!did.authentication) {
      const key = await wallet.did.extractKey(identity.issuer)

      if (!key) {
        throw new Error('response.signing.key')
      }

      await wallet.keys.expandKey(key)

      const unsignedDid = await wallet.did.helper().createDID(key, {
        id: params.request.id,
        purpose: [DIDPURPOSE_ASSERTION, DIDPURPOSE_AUTHENTICATION, DIDPURPOSE_VERIFICATION]
      })

      did = await wallet.did.helper().signDID(key, unsignedDid)
    }

    const presentation = await wallet.ssi.buildPresentation([params.credential], {
      id: params.request.id,
      holder: did,
      type: schema.responseType
    })

    return wallet.ssi.signPresentation(presentation, did, {
      challenge: params.request.proof.challenge,
      domain: params.request.proof.domain
    })
  }