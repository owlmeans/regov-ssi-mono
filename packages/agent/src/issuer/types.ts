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

export type IssuerVisitorBuilder<
  Extension extends {} = {},
  CredentialT extends Credential<MaybeArray<CredentialSubject>>
  = Credential<MaybeArray<CredentialSubject>>
  > = (wallet: WalletWrapper) => IssuerVisitor<Extension, CredentialT>


type InferUnsignedCredential<
  Type extends Credential<MaybeArray<CredentialSubject>>
  = Credential<MaybeArray<CredentialSubject>>
  > = Type extends Credential<infer Subject>
  ? UnsignedCredential<Subject>
  : never

export type IssuerVisitor<
  Extension extends {} = {},
  CredentialT extends Credential<MaybeArray<CredentialSubject>>
  = Credential<MaybeArray<CredentialSubject>>
  > = {
    claim?: {
      signClaim?: {
        clarifyIssuer?: (
          unsigned: InferUnsignedCredential<CredentialT>
        ) => Promise<DIDDocument>

        patchOffer?: (
          unsigned: UnsignedCredential<OfferSubject<CredentialT, Extension>>
        ) => Promise<void>
      }
    }
  }