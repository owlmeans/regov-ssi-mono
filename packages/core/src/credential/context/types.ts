import { CryptoHelper } from "@owlmeans/regov-ssi-common"
import { KeyChainWrapper } from "../../keys/types"

import { DIDDocument, DIDRegistryWrapper } from '@owlmeans/regov-ssi-did'
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
  Validated
} from "../types"


export type BuildCommonContextMethod = (options: {
  keys: KeyChainWrapper
  crypto: CryptoHelper
  did: DIDRegistryWrapper
  defaultSchema?: string
}) => Promise<CommonContext>

export type CommonContext = {
  keys: KeyChainWrapper
  crypto: CryptoHelper
  did: DIDRegistryWrapper
  buildLDContext: (url: string, extendedCtx?: ContextSchema, baseUrl?: string) => ContextSchema
  buildCredential: BuildCredentialMethod
  signCredential: SignCredentialMethod
  verifyCredential: VerfiyCredentailMethod
  buildPresentation: BuildPresentationMethod
  signPresentation: SignPresentationMethod
  verifyPresentation: VerifyPresentationMethod
}

export type BuildCredentialMethod = <
  SubjectType extends WrappedDocument = WrappedDocument,
  Subject extends CredentialSubject<SubjectType> = CredentialSubject<SubjectType>,
  Unsigned extends UnsignedCredential<Subject> = UnsignedCredential<Subject>
  >(options: BuildCredentailOptions<SubjectType>) => Promise<Unsigned>

// export type CommonContextType = TContext

export type BuildCredentailOptions<
  SubjectType extends WrappedDocument = WrappedDocument,
  Subject extends CredentialSubject<SubjectType> = CredentialSubject<SubjectType>
  > = {
    id: string,
    type: CredentialType
    holder: string,
    subject: Subject,
    issueanceDate?: string
    context: CredentialContextType
  }

export type SignCredentialMethod = <
  Subject extends CredentialSubject = CredentialSubject,
  CredentialT extends Credential<Subject> = Credential<Subject>,
  CredentialU extends UnsignedCredential<Subject> = UnsignedCredential<Subject>
  >(
  unsingedCredential: CredentialU,
  issuer: DIDDocument,
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
  keyId?: string
) => Promise<[boolean, VerificationResult]>

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
  holder: string
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
  challange?: string
  domain?: string
  keyId?: string
}

export type VerifyPresentationMethod = (
  presentation: Presentation,
  didDoc?: DIDDocument
) => Promise<[boolean, VerifyPresentationResult]>

export type VerifyPresentationResult<PresentationT extends Presentation = Presentation>
  = Validated<PresentationT>

