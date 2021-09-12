import { ContextObj, TContext } from "@affinidi/vc-common"
import { Validatied } from "@affinidi/vc-common/dist/verifier/util"

import { CryptoHelper, CommonCryptoKey } from "@owlmeans/regov-ssi-common"
import { KeyChainWrapper } from "../../keys/types"
import {
  CommonCredential,
  CommonCredentailSubject,
  CommonSubjectType,
  CommonType,
  CommonUnsignedCredential
} from "./types/credential"
import { DIDDocument, DIDRegistryWrapper } from '@owlmeans/regov-ssi-did'
import { CommonPresentation, CommonPresentationHolder, CommonUnsignedPresentation } from "./types/presentation"


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
  buildLDContext: (url: string, extendedCtx?: ContextObj, baseUrl?: string) => ContextObj
  buildCredential: CommonBuildCredentialMethod
  signCredential: CommonSignCredentialMethod
  verifyCredential: CommonVerfiyCredentailMethod
  buildPresentation: CommonBuildPresentationMethod
  signPresentation: CommonSignPresentationMethod
  verifyPresentation: CommonVerifyPresentationMethod
}

export type CommonBuildCredentialMethod = <
  SubjectType extends CommonSubjectType = CommonSubjectType,
  Subject extends CommonCredentailSubject<SubjectType> = CommonCredentailSubject<SubjectType>,
  Unsigned extends CommonUnsignedCredential<Subject> = CommonUnsignedCredential<Subject>
  >(options: CommonBuildCredentailOptions<SubjectType>) => Promise<Unsigned>

export type CommonContextType = TContext

export type CommonBuildCredentailOptions<
  SubjectType extends CommonSubjectType = CommonSubjectType,
  Subject extends CommonCredentailSubject<SubjectType> = CommonCredentailSubject<SubjectType>
  > = {
    id: string,
    type: CommonType
    holder: string,
    subject: Subject,
    issueanceDate?: string
    context: CommonContextType
  }

export type CommonSignCredentialMethod = <
  Subject extends CommonCredentailSubject = CommonCredentailSubject,
  Credential extends CommonCredential<Subject> = CommonCredential<Subject>,
  CredentialU extends CommonUnsignedCredential<Subject> = CommonUnsignedCredential<Subject>
  >(
  unsingedCredential: CredentialU,
  issuer: DIDDocument,
  options?: CommonSignCredentialOptions
) =>
  Promise<Credential>

export type CommonSignCredentialOptions = {
  buildProofPurposeOptions?: () => Promise<Object>
  keyId?: string
}

export type CommonVerfiyCredentailMethod = (
  credential: CommonCredential,
  did?: DIDDocument | string,
  keyId?: string
) => Promise<[boolean, CommonVerificationResult]>

export type CommonVerificationResult<Credential extends CommonCredential = CommonCredential> = Validatied<Credential>

export type CommonBuildPresentationMethod = <
  Credential extends CommonCredential = CommonCredential,
  Holder extends CommonPresentationHolder = CommonPresentationHolder
  >(
  credentials: Credential[],
  options: CommonBuildPresentationOptions<Holder>
) => Promise<CommonUnsignedPresentation<Credential, Holder>>

export type CommonBuildPresentationOptions<
  Holder extends CommonPresentationHolder = CommonPresentationHolder
  > = {
    type?: string | string[]
    context?: CommonContextType
    holder: string
  }

export type CommonSignPresentationMethod = <
  Credential extends CommonCredential = CommonCredential,
  Holder extends CommonPresentationHolder = CommonPresentationHolder
  >(
  unsignedPresentation: CommonUnsignedPresentation<Credential, Holder>,
  holder: DIDDocument,
  options?: CommonSignPresentationOptions
) => Promise<CommonPresentation<Credential, Holder>>

export type CommonSignPresentationOptions = {
  buildProofPurposeOptions?: () => Promise<Object>
  challange?: string
  domain?: string
  keyId?: string
}

export type CommonVerifyPresentationMethod = (
  presentation: CommonPresentation,
  didDoc?: DIDDocument
) => Promise<[boolean, CommonVerifyPresentationResult]>

export type CommonVerifyPresentationResult<
  Presentation extends CommonPresentation = CommonPresentation
  > = Validatied<Presentation>

