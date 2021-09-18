import { DIDDocument } from "@owlmeans/regov-ssi-did"
import {
  CredentialSubject,
  WrappedDocument,
  Credential,
  Presentation,
  MaybeArray
} from "@owlmeans/regov-ssi-core"

export type OfferSubject<
  CredentialT extends Credential<MaybeArray<CredentialSubject>> = Credential<MaybeArray<CredentialSubject>>
  > =
  CredentialSubject<
    WrappedDocument<{ credential: CredentialT }>,
    { did: DIDDocument }
  >

export const CREDENTIAL_OFFER_TYPE = 'CredentialOffer'

export type OfferCredential<Subject extends OfferSubject = OfferSubject>
  = Credential<Subject>

export type OfferBundle<BundledOffer extends OfferCredential>
  = Presentation<BundledOffer>