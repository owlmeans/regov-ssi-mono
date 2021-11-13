
import { DIDDocument } from "@owlmeans/regov-ssi-did"
import { Credential, CredentialSubject, WrappedDocument, UnsignedCredential, Identity } from "@owlmeans/regov-ssi-core"


export type EntityIdentity = Credential<EntityIdentitySubject>

export type UnsignedEntityIdentity = UnsignedCredential<EntityIdentitySubject>

export type EntityIdentitySubjectType = WrappedDocument<EntityIdentityPayload>

export type EntityIdentitySubject = CredentialSubject<
  EntityIdentitySubjectType, ExntityIdentityExtension
>

export type IdentityParams = { credential: Credential<any>, did: DIDDocument } 

export type EntityIdentityPayload = {identity: Credential<any> }

export type ExntityIdentityExtension = { did: DIDDocument }

export const ERROR_DESCRIBE_IDENTITY_WITH_EXTENSION = 'ERROR_DESCRIBE_IDENTITY_WITH_EXTENSION'
export const ERROR_NO_IDENTITY_PROVIDED = 'ERROR_NO_IDENTITY_PROVIDED'

export const CREDENTIAL_ENTITY_IDENTITY_TYPE = 'EntityIdentity'

export const IDENTITY_REQUEST_TYPE = 'IdentityRequest'

export const IDENTITY_RESPONSE_TYPE = 'IdentityResponse'

export const isIdentity = (identity: Credential): identity is Identity => {
  return identity.type.includes(CREDENTIAL_ENTITY_IDENTITY_TYPE)
}