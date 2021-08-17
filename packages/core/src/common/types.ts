import { GetSignSuiteFn, TContext } from "@affinidi/vc-common";
import { CryptoContext } from "crypto/types";
import { KeyChain, KeyChainWrapper } from "keys/types";
import { CommonCredentail, CommonCredentailSubject, CommonSubjectType, CommonType, CommonUnsignedCredential } from "./types/credential";
import { CommonKey } from "./types/key";

export type BuildCommonContextMethod = (options: {
  keyChain: KeyChainWrapper
  cryptoContext: CryptoContext
}) => Promise<CommonContext>

export type CommonContext = {
  keyChain: KeyChainWrapper
  cryptoContext: CryptoContext
  buildCredential: CommonBuildCredentialMethod
  signCredential: CommonSignCredentialMethod
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
    key: CommonKey,
    options?: CommonSignCredentialOptions
  ) =>
    Promise<CommonCredentail<Subject>>

export type CommonSignCredentialOptions = {
  controllerRole?: ControllerRole
  buildProofPurposeOptions?: () => Promise<Object>
}

export type ControllerRole =
  typeof COMMON_CONTROLLER_ROLE_ISSUER
  | typeof COMMON_CONTROLLER_ROLE_HOLDER

export const COMMON_CONTROLLER_ROLE_ISSUER = 'issuer'
export const COMMON_CONTROLLER_ROLE_HOLDER = 'holder'