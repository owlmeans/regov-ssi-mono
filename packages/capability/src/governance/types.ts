
import { ClaimCredential, ClaimSubject, OfferCredential, OfferSubject } from "@owlmeans/regov-ssi-agent"
import {
  ContextSchema,
  Credential,
  CredentialSubject,
  UnsignedCredential,
  WrappedDocument,
} from "@owlmeans/regov-ssi-core"
import { DIDDocument } from "@owlmeans/regov-ssi-did"


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

export type CapabilityClaimSubject<
  PayloadProps extends {} = {},
  ExtensionProps extends {} = {},
  CredentialProps extends {} = {}
  > = ClaimSubject<
    UnsignedCapabilityCredential<
      CapabilitySubject<PayloadProps, ExtensionProps, CredentialProps>
    >
  >

export type OfferCapabilityExtension = {
  chain: DIDDocument[]
}

export type ClaimCapability 
  = ClaimCredential<ClaimSubject<CapabilityCredential>>

export type OfferCapability
  = OfferCredential<OfferSubject<CapabilityCredential, OfferCapabilityExtension>>

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
    '@type': string | string[]
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
export const CREDENTIAL_GOVERNANCE_TYPE = 'GovernanceCapability'

export const REGISTRY_SECTION_CAPABILITY = 'capability'