
import { DIDDocument } from "@owlmeans/regov-ssi-did"
import { Credential, CredentialSubject, CredentialSubjectType, UnsignedCredential } from "../../credential/types"


export type EntityIdentity = Credential<EntityIdentitySubject>

export type UnsignedEntityIdentity = UnsignedCredential<EntityIdentitySubject>

export type EntityIdentitySubjectType = CredentialSubjectType<EntityIdentityPayload>

export type EntityIdentitySubject = CredentialSubject<
  EntityIdentitySubjectType, ExntityIdentityExtension
>

export type IdentityParams = {
  credential: Credential<any>,
  did: DIDDocument
} 

export type EntityIdentityPayload = {
  identity: Credential<any>
}

export type ExntityIdentityExtension = {
  did: DIDDocument
}

export const ERROR_DESCRIBE_IDENTITY_WITH_PAYLOAD = 'ERROR_DESCRIBE_IDENTITY_WITH_PAYLOAD'
export const ERROR_NO_IDENTITY_PROVIDED = 'ERROR_NO_IDENTITY_PROVIDED'

export const CREDENTIAL_ENTITY_IDENTITY_TYPE = 'EntityIdentity'