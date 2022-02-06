import {
  CryptoHelper,
  MaybeArray
} from "@owlmeans/regov-ssi-common"
import { KeyChainWrapper } from "../../keys/types"

import {
  LoadedDocument,
  BuildDocumentLoader,
  DIDDocument,
  DIDHelper,
  DIDRegistryWrapper,
  DIDDocumentUnsinged
} from '@owlmeans/regov-ssi-did'
import {
  Credential,
  CredentialContextType,
  CredentialSubject,
  WrappedDocument,
  CredentialType,
  Presentation,
  PresentationHolder,
  UnsignedCredential,
  UnsignedPresentation,
  ContextSchema,
  Validated,
} from "../types"

export type BuildSSICoreMethod = (options: {
  keys: KeyChainWrapper
  crypto: CryptoHelper
  did: DIDRegistryWrapper
  defaultSchema?: string
}) => Promise<SSICore>

export type SSICore = {
  keys: KeyChainWrapper
  crypto: CryptoHelper
  did: DIDRegistryWrapper
  buildContext: (url: string, extendedCtx?: ContextSchema, baseUrl?: string) => ContextSchema
  buildCredential: BuildCredentialMethod
  signCredential: SignCredentialMethod
  verifyCredential: VerfiyCredentailMethod
  buildPresentation: BuildPresentationMethod
  signPresentation: SignPresentationMethod
  verifyPresentation: VerifyPresentationMethod
  verifyEvidence: VerifyEvidenceMethod
  verifySchema: VerifySchemaMethod
}

export type VerifySchemaMethod = (
  credential: Credential,
  presentation?: Presentation,
  options?: LocalDocumentLoader | VerifySchemaOptions
) => Promise<[boolean, Error[]]>

export type VerifySchemaOptions = {
  localLoader?: LocalDocumentLoader
  nonStrictEvidence?: boolean
}

export type BuildCredentialMethod = <
  SubjectType extends WrappedDocument = WrappedDocument,
  Subject extends CredentialSubject<SubjectType> = CredentialSubject<SubjectType>,
  Unsigned extends UnsignedCredential<Subject> = UnsignedCredential<Subject>
  >(options: BuildCredentailOptions<SubjectType>) => Promise<Unsigned>

export type BuildCredentailOptions<
  SubjectType extends WrappedDocument = WrappedDocument,
  Subject extends CredentialSubject<SubjectType> = CredentialSubject<SubjectType>
  > = {
    id: string,
    type: CredentialType
    holder: DIDDocument | DIDDocumentUnsinged,
    subject: Subject,
    issueanceDate?: string
    context: CredentialContextType
  }

export type SignCredentialMethod = <
  Subject extends CredentialSubject = CredentialSubject,
  CredentialT extends Credential<Subject> = Credential<Subject>,
  CredentialU extends UnsignedCredential<MaybeArray<Subject>> = UnsignedCredential<MaybeArray<Subject>>
  >(
  unsingedCredential: CredentialU,
  issuer?: DIDDocument,
  options?: SignCredentialOptions
) =>
  Promise<CredentialT>

export type SignCredentialOptions = {
  buildProofPurposeOptions?: () => Promise<Object>
  keyId?: string
}

export type VerfiyCredentailMethod = (
  credential: Credential,
  did?: DIDDocument | string,
  keyId?: string | VerifyCredentialOptions
) => Promise<[boolean, VerificationResult]>

export type VerifyCredentialOptions = {
  keyId?: string
  localLoader?: LocalDocumentLoader
  verifyEvidence?: boolean
  verifySchema?: boolean
  nonStrictEvidence?: boolean
}

export type VerificationResult<CredentialT extends Credential = Credential>
  = Validated<CredentialT>

export type BuildPresentationMethod = <
  CredentialT extends Credential = Credential,
  Holder extends PresentationHolder = PresentationHolder
  >(
  credentials: CredentialT[],
  options: BuildPresentationOptions
) => Promise<UnsignedPresentation<CredentialT, Holder>>

export type BuildPresentationOptions = {
  id?: string
  type?: string | string[]
  context?: CredentialContextType
  holder: PresentationHolder
}

export type SignPresentationMethod = <
  CredentialT extends Credential = Credential,
  Holder extends PresentationHolder = PresentationHolder
  >(
  unsignedPresentation: UnsignedPresentation<CredentialT, Holder>,
  holder: DIDDocument,
  options?: SignPresentationOptions
) => Promise<Presentation<CredentialT, Holder>>

export type SignPresentationOptions = {
  buildProofPurposeOptions?: () => Promise<Object>
  challenge?: string
  domain?: string
  keyId?: string
}

export type VerifyPresentationMethod = (
  presentation: Presentation,
  didDoc?: DIDDocument,
  options?: LocalDocumentLoader | VerifyPresentationOptions
) => Promise<[boolean, VerifyPresentationResult]>

export type VerifyPresentationOptions = {
  localLoader?: LocalDocumentLoader,
  testEvidence?: boolean,
  nonStrictEvidence?: boolean 
}

export type VerifyEvidenceMethod = (
  credential: Credential,
  presentation?: Presentation,
  options?: LocalDocumentLoader | VerifyEvidenceOptions
) => Promise<[boolean, Error[]]>

export type VerifyEvidenceOptions = {
  localLoader?: LocalDocumentLoader
  nonStrictEvidence?: boolean
}

export type LocalDocumentLoader = (
  didHelper: DIDHelper,
  loaderBuilder: BuildDocumentLoader<Credential>,
  presentation: Presentation,
  didDoc?: DIDDocument
) => (url: string) => Promise<LoadedDocument<Credential>>

export type VerifyPresentationResult<PresentationT extends Presentation = Presentation>
  = Validated<PresentationT>

export const ERROR_NO_PRESENTATION_SIGNING_KEY = 'ERROR_NO_PRESENTATION_SIGNING_KEY'
export const ERROR_NO_CREDENTIAL_SIGNING_KEY = 'ERROR_NO_CREDENTIAL_SIGNING_KEY'