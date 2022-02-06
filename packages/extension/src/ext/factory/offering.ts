import { DIDDocument, DIDDocumentUnsinged, VERIFICATION_KEY_CONTROLLER } from "@owlmeans/regov-ssi-did"
import { Credential } from '@owlmeans/regov-ssi-core'
import { OfferingFactoryMethodBuilder } from "../types"


export const defaultOfferingFactory: OfferingFactoryMethodBuilder = schema =>
  async (wallet, params) => {
    const { holder, claim, subject, cryptoKey, claimType, offerType, id, challenge, domain } = params
    const credential = JSON.parse(JSON.stringify(claim)) as Credential
    let issuerDid: DIDDocument | DIDDocumentUnsinged = JSON.parse(JSON.stringify(holder))
    delete (issuerDid as any).proof
    issuerDid = await wallet.did.helper().signDID(
      cryptoKey, issuerDid, VERIFICATION_KEY_CONTROLLER
    )
    delete (credential as any).proof
    if (claimType) {
      const idx = credential.type.findIndex(type => type === claimType)
      credential.type.splice(idx, 1)
    }

    credential.holder = holder

    credential.credentialSubject = subject as any

    const signed = await wallet.ssi.signCredential(credential, issuerDid as DIDDocument)

    const offer = await wallet.ssi.buildPresentation([signed], {
      holder: issuerDid,
      type: offerType,
      id
    })

    return wallet.ssi.signPresentation(offer, issuerDid as DIDDocument, { challenge, domain })
  }