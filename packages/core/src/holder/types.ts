import { MaybeArray } from "@affinidi/vc-common"
import { DIDDocument, DIDDocumentUnsinged } from "@owlmeans/regov-ssi-did"
import { CredentialSubject, CredentialSubjectType, UnsignedCredential } from "../credential/types"

export const ERROR_NO_IDENTITY_TO_SIGN_CREDENTIAL = 'ERROR_NO_IDENTITY_TO_SIGN_CREDENTIAL'

export type ClaimSubject<
  CredentialUT extends UnsignedCredential<MaybeArray<CredentialSubject>> = UnsignedCredential<MaybeArray<CredentialSubject>>
  > =
  CredentialSubject<
    CredentialSubjectType<{ credential: CredentialUT }>,
    { did: DIDDocumentUnsinged }
  >

export const CREDENTIAL_CLAIM_TYPE = 'CredentialClaim'