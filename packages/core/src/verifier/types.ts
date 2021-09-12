
import { DIDDocument } from "@owlmeans/regov-ssi-did"
import {
  CredentialSubject,
  CredentialSubjectType,
  Credential,
  Presentation,
  CredentialType
} from "../credential/types"

export type RequestSubject = CredentialSubject<
  CredentialSubjectType<{
    type: CredentialType,
    issuer?: { id?: string, capability?: string }
  }>
>

export const CREDENTIAL_REQUEST_TYPE = 'CredentialRequest'

export type RequestCredential = Credential<RequestSubject>

export type RequestBundle = {
  presentation: Presentation<RequestCredential>,
  did: DIDDocument
}