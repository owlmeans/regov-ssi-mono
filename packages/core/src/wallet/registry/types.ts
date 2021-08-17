import { CredentialSubject, CredentialType, UnsignedCredentail, VerificationOptions } from "credential/types"


export type CredentialsRegistry = {
  rootCredential?: string
  defaultSection: string
  credentials: { [section: string]: CredentialWrapper[] }
}

export type RegistryWrapperBuilder = (registry: CredentialsRegistry) => CredentialsRegistryWrapper

export type RegistryWrapperMethodBuilder<Method extends Function> = (registry: CredentialsRegistry) => Method

export type CredentialsRegistryWrapper = {
  registry: CredentialsRegistry
  addCredential: AddCredentialMethod
  lookupCredentials: LookupCredentialsMethod
  removeCredential: RemoveCredentialMethod
}

export type RemoveCredentialMethod =
  (credential: Credential | UnsignedCredentail | CredentialWrapper) =>
    Promise<CredentialWrapper>

export type AddCredentialMethod = (
  credential: Credential,
  section?: string
) => Promise<CredentialsRegistryWrapper>

export type LookupCredentialsMethod<
  Subject extends CredentialSubject = CredentialSubject,
  Type extends UnsignedCredentail = UnsignedCredentail<Subject>
  > = (
    type: CredentialType,
    options?: VerificationOptions,
  ) => Promise<CredentialWrapper<Subject, Type>[]>

export type RegistryType = typeof REGISTRY_TYPE_IDENTITIES
  | typeof REGISTRY_TYPE_CREDENTIALS

export const REGISTRY_TYPE_IDENTITIES = 'identities'
export const REGISTRY_TYPE_CREDENTIALS = 'credentials'

export type CredentialWrapper<
  Subject extends CredentialSubject = CredentialSubject,
  Type extends UnsignedCredentail = UnsignedCredentail<Subject>
  > = {
    credential: Type
    meta: CredentialWrapperMetadata
  }

export type CredentialWrapperMetadata = {
  secure: boolean
  nonce?: string
  keyDigest?: string
  holderDigest?: string
  ownershipProof?: string | Credential
}