import { TContext } from "@affinidi/vc-common"
import { CryptoHelper, CommonCryptoKey } from "metabelarusid-common"
import { KeyChainWrapper } from "keys/types"
import { CommonCredentail, CommonCredentailSubject, CommonSubjectType, CommonType, CommonUnsignedCredential } from "./types/credential"
import { DIDRegistryWrapper } from 'metabelarusid-did'
import { Validatied } from "@affinidi/vc-common/dist/verifier/util"

export type BuildCommonContextMethod = (options: {
  keys: KeyChainWrapper
  crypto: CryptoHelper,
  did: DIDRegistryWrapper
}) => Promise<CommonContext>

export type CommonContext = {
  keys: KeyChainWrapper
  crypto: CryptoHelper
  did: DIDRegistryWrapper
  buildCredential: CommonBuildCredentialMethod
  signCredential: CommonSignCredentialMethod
  verifyCredential: CommonVerfiyCredentailMethod
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
    context: TContext
  }

export type CommonSignCredentialMethod =
  <
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

export type ControllerRole =
  typeof COMMON_CONTROLLER_ROLE_ISSUER
  | typeof COMMON_CONTROLLER_ROLE_HOLDER

export const COMMON_CONTROLLER_ROLE_ISSUER = 'issuer'
export const COMMON_CONTROLLER_ROLE_HOLDER = 'holder'