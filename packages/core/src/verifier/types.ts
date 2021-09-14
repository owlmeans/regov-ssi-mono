
import { DIDDocument, DIDDocumentUnsinged } from "@owlmeans/regov-ssi-did"
import {
  CredentialSubject,
  CredentialSubjectType,
  Credential,
  Presentation,
  CredentialType
} from "../credential/types"


export type RequestSubject = CredentialSubject<CredentialRequestSubjectType, {}>

export type CredentialRequestSubjectType = CredentialSubjectType<{
  issuer?: { id?: string, capabilities?: string[] }
  holder?: string,
  source?: string
}>

export const CREDENTIAL_REQUEST_TYPE = 'CredentialRequest'

export type RequestCredential = Credential<RequestSubject>

export type RequestBundle = Presentation<RequestCredential>

export const ERROR_REQUEST_RESPONSE_DONT_MATCH = 'ERROR_REQUEST_RESPONSE_DONT_MATCH'