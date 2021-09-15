
import { DIDDocument, DIDDocumentUnsinged } from "@owlmeans/regov-ssi-did"
import {
  CredentialSubject,
  WrappedDocument,
  Credential,
  Presentation,
  CredentialType
} from "../credential/types"
import { EntityIdentity } from "../wallet/identity/types"


export type RequestSubject = CredentialSubject<CredentialRequestDoc, {}>

export type CredentialRequestDoc = WrappedDocument<{
  issuer?: { id?: string, capabilities?: string[] }
  holder?: string,
  source?: string
}>

export const CREDENTIAL_REQUEST_TYPE = 'CredentialRequest'

export type RequestCredential = Credential<RequestSubject>

export type RequestBundle = Presentation<RequestCredential>

export const ERROR_REQUEST_RESPONSE_DONT_MATCH = 'ERROR_REQUEST_RESPONSE_DONT_MATCH'

export const ERROR_NO_IDENTITY_TO_VERIFY_CREDENTIAL = 'ERROR_NO_IDENTITY_TO_VERIFY_CREDENTIAL'