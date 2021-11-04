
import {
  ContextSchema,
  Credential, CredentialSubject, CredentialType, MaybeArray, UnsignedCredential, WrappedDocument
} from '@owlmeans/regov-ssi-core'
import { DIDDocument } from '@owlmeans/regov-ssi-did'


export type SourceExtension = { source?: Credential, sourceDid?: DIDDocument }

export type CredentialWithSource<
  Subject extends MaybeArray<SubjectWithSource> = MaybeArray<SubjectWithSource>
  > = Credential<Subject>

export type UnsignedCredentailWithSource<
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
  ctxSchema: ContextSchema | ContextSchema[]
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