import { DIDDocument } from "@owlmeans/regov-ssi-did"
import {
  CredentialSubject,
  WrappedDocument,
  Credential,
  Presentation,
  MaybeArray,
  UnsignedCredential,
  WalletWrapper
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

export type IssuerVisiterBuilder<
  Extension extends {} = {}
  > = (wallet: WalletWrapper) => IssuerVisiter<Extension>

export type IssuerVisiter<Extension extends {} = {}> = {
  claim?: {
    signClaim?: {
      patchOffer?: <
        CredentialT extends Credential<MaybeArray<CredentialSubject>>
        = Credential<MaybeArray<CredentialSubject>>
        >(
        unsigned: UnsignedCredential<OfferSubject<CredentialT, Extension>>
      ) => Promise<void>
    }
  }
}