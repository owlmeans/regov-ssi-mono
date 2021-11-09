
import { ClaimCredential, ClaimSubject, OfferCredential, OfferSubject } from '@owlmeans/regov-ssi-agent'
import {
  ContextSchema,
  Credential, CredentialSubject, CredentialType, MaybeArray, UnsignedCredential, WrappedDocument
} from '@owlmeans/regov-ssi-core'
import { DIDDocument } from '@owlmeans/regov-ssi-did'


export type SourceExtension = { source?: Credential, sourceDid?: DIDDocument }

export type CredentialWithSource<
  Subject extends MaybeArray<SubjectWithSource> = MaybeArray<SubjectWithSource>
  > = Credential<Subject>

export type UnsignedCredentialWithSource<
  Subject extends MaybeArray<SubjectWithSource> = MaybeArray<SubjectWithSource>
  > = UnsignedCredential<Subject>

export type SubjectWithSource<
  SubjectType extends WrappedDocument = WrappedDocument,
  ExtendedType extends {} = {}
  > = CredentialSubject<SubjectType, SourceExtension & ExtendedType>

export const CREDENTIAL_WITHSOURCE_TYPE = 'CredentialWithSource'

export const hasCredentialSource = (credential: Credential): credential is CredentialWithSource => {
  return credential.type.includes(CREDENTIAL_WITHSOURCE_TYPE)
}

export type CapabilityDoc<DefaultValues extends {} = {}> = {
  name: string
  description?: string
  defaults?: DefaultValues
}

export type CapabilityExt = {
  schema?: CapabilitySchema | CapabilitySchema[]
}

export type CapabilitySchema = {
  ctxSchema?: ContextSchema | ContextSchema[]
  type: string | string[]
}

export type CapabilitySubject<
  Def extends {} = {},
  Ext extends CapabilityExt = CapabilityExt,
  Doc extends CapabilityDoc = CapabilityDoc<Def>
  > = SubjectWithSource<WrappedDocument<Doc>, Ext>

export type UnsignedCapability<
  Def extends {} = {},
  Ext extends CapabilityExt = CapabilityExt,
  Subject extends CapabilitySubject = CapabilitySubject<Def, Ext>
  > = UnsignedCredential<Subject>

export type Capability<
  Def extends {} = {},
  Ext extends CapabilityExt = CapabilityExt,
  Subject extends CapabilitySubject = CapabilitySubject<Def, Ext>
  > = Credential<Subject>

export const CAPABILITY_CREDENTIAL_TYPE = 'Capability'

export const isCapability = (credential: Credential): credential is Capability => {
  return credential.type.includes(CAPABILITY_CREDENTIAL_TYPE)
}

export const REGISTRY_TYPE_CAPABILITY = 'capabilities'

export type ClaimCapability<
  Def extends {} = {},
  Ext extends CapabilityExt = CapabilityExt,
  Subject extends CapabilitySubject = CapabilitySubject<Def, Ext>
  > = ClaimCredential<ClaimSubject<UnsignedCapability<Def, Ext, Subject>>>

export type OfferCapability<
  Def extends {} = {},
  Ext extends CapabilityExt = CapabilityExt,
  Subject extends CapabilitySubject = CapabilitySubject<Def, Ext>
  > = OfferCredential<OfferSubject<Capability<Def, Ext, Subject>>>


export const ERROR_CREDENTIAL_DOESNTHAVE_SOURCE = 'ERROR_CREDENTIAL_DOESNTHAVE_SOURCE'
export const ERROR_CREDENTIAL_SOURCE_UNVERIFIABLE = 'ERROR_CREDENTIAL_SOURCE_UNVERIFIABLE'
export const ERROR_SOURCE_CANTINVOKE_CREDENTIAL = 'ERROR_SOURCE_CANTINVOKE_CREDENTIAL'
export const ERROR_SOURCE_CANTGENERATE_CREDENTIAL = 'ERROR_SOURCE_CANTGENERATE_CREDENTIAL'
export const ERROR_ROOT_SOURCE_UNTRUSTED = 'ERROR_ROOT_SOURCE_UNTRUSTED'