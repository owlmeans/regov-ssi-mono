import {
  DIDDocument, DIDDocumentUnsinged, DIDPURPOSE_ASSERTION, DIDPURPOSE_AUTHENTICATION,
  VERIFICATION_KEY_CONTROLLER
} from "@owlmeans/regov-ssi-did"
import { buildWalletLoader, Credential } from '@owlmeans/regov-ssi-core'
import { OfferMethodBuilder } from "../types"


export const defaultOfferMethod: OfferMethodBuilder = schema => async (wallet, params) => {
  const {
    claim, credential, holder, subject, cryptoKey, claimType, offerType, id, challenge, domain
  } = params

  const [isValid, result] = await wallet.ssi.verifyPresentation(claim, undefined, {
    testEvidence: true, nonStrictEvidence: true, localLoader: buildWalletLoader(wallet)
  })

  if (!isValid) {
    console.log(result)
    throw 'claim.invalid'
  }

  const offeredCredential = JSON.parse(JSON.stringify(credential)) as Credential
  let issuerDid: DIDDocument | DIDDocumentUnsinged = JSON.parse(JSON.stringify(holder))
  delete (issuerDid as any).proof
  issuerDid = await wallet.did.helper().signDID(
    cryptoKey, issuerDid, VERIFICATION_KEY_CONTROLLER,
    [DIDPURPOSE_ASSERTION, DIDPURPOSE_AUTHENTICATION]
  )
  delete (offeredCredential as any).proof
  if (claimType) {
    const idx = offeredCredential.type.findIndex(type => type === claimType)
    offeredCredential.type.splice(idx, 1)
  }

  offeredCredential.holder = holder
  offeredCredential.credentialSubject = subject as any

  const signed = await wallet.ssi.signCredential(offeredCredential, issuerDid as DIDDocument)
  const offer = await wallet.ssi.buildPresentation([signed], {
    holder: issuerDid, type: offerType, id
  })

  return wallet.ssi.signPresentation(offer, issuerDid as DIDDocument, { challenge, domain })
}


