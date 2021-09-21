import {
  Credential,
  CredentialSubject,
  Presentation,
  UnsignedCredential,
} from "../../vc/types"


export type CredentialsRegistry<
  Subject extends CredentialSubject = CredentialSubject,
  Type extends RegistryItem<Subject> = Credential<Subject>
  > = {
    rootCredential?: string
    defaultSection: string
    credentials: { [section: string]: CredentialWrapper<Subject, Type>[] }
  }

export type RegistryWrapperBuilder = (registry: CredentialsRegistry) => CredentialsRegistryWrapper

export type RegistryWrapperMethodBuilder<Method extends Function> = (registry: CredentialsRegistry) => Method

export type CredentialsRegistryWrapper = {
  registry: CredentialsRegistry
  addCredential: AddCredentialMethod
  lookupCredentials: LookupCredentialsMethod
  removeCredential: RemoveCredentialMethod
  getCredential: GetCredentialMethod
}

export type RemoveCredentialMethod =
  (
    credential: RegistryItem | CredentialWrapper,
    section?: string
  ) => Promise<CredentialWrapper>

export type AddCredentialMethod = <
  Subject extends CredentialSubject = CredentialSubject,
  Type extends RegistryItem<Subject> = Credential<Subject>
  >(
  credential: Type,
  section?: string
) => Promise<CredentialWrapper<Subject, Type>>

export type RegistryItem<
  Subject extends CredentialSubject = CredentialSubject,
  PresentationT extends Presentation = Presentation
  > =
  Credential<Subject> | UnsignedCredential<Subject>
  | Presentation
  | PresentationT

export type LookupCredentialsMethod = <
  Subject extends CredentialSubject = CredentialSubject,
  Type extends RegistryItem<Subject> = Credential<Subject>
  >(
  type: string | string[],
  section?: string
) => Promise<CredentialWrapper<Subject, Type>[]>

export type GetCredentialMethod = <
  Subject extends CredentialSubject = CredentialSubject,
  Type extends RegistryItem<Subject> = Credential<Subject>
  >(
  id?: string,
  section?: string
) => CredentialWrapper<Subject, Type> | undefined

export type RegistryType = typeof REGISTRY_TYPE_IDENTITIES
  | typeof REGISTRY_TYPE_CREDENTIALS
  | string

export const REGISTRY_TYPE_IDENTITIES = 'identities'
export const REGISTRY_TYPE_CREDENTIALS = 'credentials'
export const REGISTRY_TYPE_CLAIMS = 'claims'
export const REGISTRY_TYPE_REQUESTS = 'requests'

export const REGISTRY_SECTION_OWN = 'own'
export const REGISTRY_SECTION_PEER = 'peer'

export type CredentialWrapper<
  Subject extends CredentialSubject = CredentialSubject,
  Type extends RegistryItem<Subject> = Credential<Subject>
  > = {
    credential: Type
    meta: CredentialWrapperMetadata
  }

export type CredentialWrapperMetadata = {
  secure: boolean
  nonce?: string
  keyDigest?: string
  holderDigest?: string
  ownershipProof?: string
}