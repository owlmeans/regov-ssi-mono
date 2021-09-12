import { MaybeArray } from "@affinidi/vc-common"
import { DIDDocument, DIDDocumentUnsinged } from "@owlmeans/regov-ssi-did"
import { CredentialSubject, CredentialSubjectType, UnsignedCredential, Credential, Presentation } from "../credential/types"


export type ClaimSubject<
  CredentialUT extends UnsignedCredential<MaybeArray<CredentialSubject>> = UnsignedCredential<MaybeArray<CredentialSubject>>
  > =
  CredentialSubject<
    CredentialSubjectType<{ credential: CredentialUT }>,
    { did: DIDDocumentUnsinged }
  >

export const CREDENTIAL_CLAIM_TYPE = 'CredentialClaim'

export type ClaimCredential<Subject extends ClaimSubject = ClaimSubject>
  = Credential<Subject>

export type ClaimBundle<BundledClaim extends ClaimCredential>
  = {
    presentation: Presentation<BundledClaim>,
    did: DIDDocument
  }

export const ERROR_NO_IDENTITY_TO_SIGN_CREDENTIAL = 'ERROR_NO_IDENTITY_TO_SIGN_CREDENTIAL'

export const ERROR_UNTUSTED_ISSUER = 'ERROR_UNTUSTED_ISSUER'

export const ERROR_WRONG_CLAIM_SUBJECT_TYPE = 'ERROR_WRONG_CLAIM_SUBJECT_TYPE'

export const CLAIM_TYPE_PREFFIX = 'Claim'