import { MaybeArray } from "@affinidi/vc-common"
import { DIDDocument, DIDDocumentUnsinged } from "@owlmeans/regov-ssi-did"
import { CredentialSubject, CredentialSubjectType, UnsignedCredential, Credential, Presentation } from "../credential/types"

export type OfferSubject<
  CredentialT extends Credential<MaybeArray<CredentialSubject>> = Credential<MaybeArray<CredentialSubject>>
  > =
  CredentialSubject<
    CredentialSubjectType<{ credential: CredentialT }>,
    { did: DIDDocument }
  >

export const CREDENTIAL_OFFER_TYPE = 'CredentialOffer'

export type OfferCredential<Subject extends OfferSubject = OfferSubject>
  = Credential<Subject>

export type OfferBundle<BundledOffer extends OfferCredential>
  = {
    presentation: Presentation<BundledOffer>,
    did: DIDDocument
  }