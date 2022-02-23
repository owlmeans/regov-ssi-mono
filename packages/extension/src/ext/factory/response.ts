import { DIDPURPOSE_ASSERTION, DIDPURPOSE_VERIFICATION } from "@owlmeans/regov-ssi-did"
import { ResponseFactoryMethodBuilder } from "../types"
import { ERROR_FACTORY_NO_IDENTITY } from "./types"


export const defaultResponseFactory: ResponseFactoryMethodBuilder = schema =>
  async (wallet, params) => {
    const identity = params.identity || wallet.getIdentity()?.credential
    if (!identity) {
      throw ERROR_FACTORY_NO_IDENTITY
    }

    const key = await wallet.did.extractKey(identity.issuer)

    if (!key) {
      throw new Error('response.signing.key')
    }

    await wallet.keys.expandKey(key)

    const unsignedDid = await wallet.did.helper().createDID(key, {
      id: params.request.id,
      purpose: [DIDPURPOSE_ASSERTION, DIDPURPOSE_VERIFICATION]
    })

    const did = await wallet.did.helper().signDID(key, unsignedDid)

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