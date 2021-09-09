import { TContext } from "@affinidi/vc-common"
import { Validatied } from "@affinidi/vc-common/dist/verifier/util"

import { CryptoHelper, CommonCryptoKey } from "@owlmeans/regov-ssi-common"
import { KeyChainWrapper } from "../../keys/types"
import {
  CommonCredentail,
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
}) => Promise<CommonContext>

export type CommonContext = {
  keys: KeyChainWrapper
  crypto: CryptoHelper
  did: DIDRegistryWrapper
  buildCredential: CommonBuildCredentialMethod
  signCredential: CommonSignCredentialMethod
  verifyCredential: CommonVerfiyCredentailMethod
  buildPresentation: CommonBuildPresentationMethod
  signPresentation: CommonSignPresentationMethod
}

export type CommonBuildCredentialMethod = <
  SubjectType extends CommonSubjectType = CommonSubjectType,
  Subject extends CommonCredentailSubject<SubjectType> = CommonCredentailSubject<SubjectType>
  >(options: CommonBuildCredentailOptions<SubjectType>) =>
  Promise<CommonUnsignedCredential<Subject>>

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
  Subject extends CommonCredentailSubject = CommonCredentailSubject
  >(
  unsingedCredential: CommonUnsignedCredential<Subject>,
  issuer: string,
  key: CommonCryptoKey,
  options?: CommonSignCredentialOptions
) =>
  Promise<CommonCredentail<Subject>>

export type CommonSignCredentialOptions = {
  controllerRole?: ControllerRole
  buildProofPurposeOptions?: () => Promise<Object>
}

export type CommonVerfiyCredentailMethod = (
  credential: CommonCredentail,
  key: CommonCryptoKey
) => Promise<[boolean, CommonVerificationResult]>

export type CommonVerificationResult<Credential extends CommonCredentail = CommonCredentail> = Validatied<Credential>

export type CommonBuildPresentationMethod = <
  Credential extends CommonCredentail = CommonCredentail,
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
    holder: Holder | DIDDocument
  }

export type CommonSignPresentationMethod = <
  Credential extends CommonCredentail = CommonCredentail,
  Holder extends CommonPresentationHolder = CommonPresentationHolder
  >(
  unsignedPresentation: CommonUnsignedPresentation<Credential, Holder>,
  holder: DIDDocument,
  key: CommonCryptoKey,
  options?: CommonSignPresentationOptions
) => Promise<CommonPresentation<Credential, Holder>>

export type CommonSignPresentationOptions = {
  buildProofPurposeOptions?: () => Promise<Object>
  challange?: string
  domain?: string
}

export type CommonVerifyPresentationMethod = (
  presentation: CommonPresentation,
  key: CommonCryptoKey
) => Promise<[boolean, CommonVerifyPresentationResult]>

export type CommonVerifyPresentationResult<
  Presentation extends CommonPresentation = CommonPresentation
  > = Validatied<Presentation>

export type ControllerRole =
  typeof COMMON_CONTROLLER_ROLE_ISSUER
  | typeof COMMON_CONTROLLER_ROLE_HOLDER

export const COMMON_CONTROLLER_ROLE_ISSUER = 'issuer'
export const COMMON_CONTROLLER_ROLE_HOLDER = 'holder'