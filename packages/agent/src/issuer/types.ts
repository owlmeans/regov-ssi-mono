import { DIDDocument } from "@owlmeans/regov-ssi-did"
import {
  CredentialSubject,
  WrappedDocument,
  Credential,
  Presentation,
  MaybeArray,
  UnsignedCredential,
  WalletWrapper,
  UnsignedPresentation
} from "@owlmeans/regov-ssi-core"

export type OfferSubject<
  CredentialT extends Credential<MaybeArray<CredentialSubject>> = Credential<MaybeArray<CredentialSubject>>,
  Extension extends {} = {}
  > =
  CredentialSubject<
    WrappedDocument<{ credential: CredentialT }>,
    { did: DIDDocument } & Extension
  >

export const CREDENTIAL_OFFER_TYPE = 'CredentialOffer'

export type OfferCredential<Subject extends OfferSubject = OfferSubject>
  = Credential<Subject>

export type OfferBundle<BundledOffer extends OfferCredential>
  = Presentation<BundledOffer>

