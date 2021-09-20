
import {
  ContextSchema,
  Credential,
  CredentialSubject,
  UnsignedCredential,
  WrappedDocument,
} from "@owlmeans/regov-ssi-core"


export type CapabilityCredential<
  Subject extends CapabilitySubject = CapabilitySubject
  > = Credential<Subject>

export type UnsignedCapabilityCredential<
  Subject extends CapabilitySubject = CapabilitySubject
  > = UnsignedCredential<Subject>

export type CapabilitySubject<
  PayloadProps extends {} = {},
  ExtensionProps extends {} = {},
  CredentialProps extends {} = {}
  > = CredentialSubject<
    WrappedDocument<
      CapabilityDocument<PayloadProps, ExtensionProps, CredentialProps>
    >,
    CapabilityExtension
  >

export type CapabilityExtension = {
  root?: string
  source: string
  name: string
  description?: string
}

export type CapabilityDocument<
  PayloadProps extends {} = {},
  ExtensionProps extends {} = {},
  CredentialProps extends {} = {}
  > = {
    '@type': string[]
    credentialSchema?: ContextSchema
    subjectSchema?: ContextSchema
    credentialProps?: CredentialProps
    subjectProps?: {
      payload?: PayloadProps,
      extension?: ExtensionProps
    }
    selfIssuing?: boolean
  }

export const CREDENTIAL_CAPABILITY_TYPE = 'CredentialCapability'