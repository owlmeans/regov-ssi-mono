import { ControllerRole } from "common/types"
import { CommonCredentail, CommonCredentailSubject, CommonSubjectType, CommonType, CommonUnsignedCredential } from "common/types/credential"
import { KeyPair } from "keys/types"

export type Credential<Subject extends CredentialSubject = CredentialSubject>
  = CommonCredentail<Subject> & UnsignedCredentail<Subject> & {}

export type Identity<Subject extends IdentitySubect = IdentitySubect>
  = {} & Credential<Subject>

export type IdentitySubect = {} & CredentialSubject

export type VerifyCredentialMethod = (
  credential: Credential,
  options?: VerificationOptions
) => Promise<boolean>

export type VerificationOptions = {
  issuer?: string | string[]
  holder?: string
  id?: string | string[]
  tracedTo?: string
  issuerIdentity?: string | string[]
  holderIdentity?: string
  type?: CredentialType
}

export type CreateCredentialMethod =
  <
    SubjectType extends CredentialSubjectType = CredentialSubjectType,
    Subject extends CredentialSubject<SubjectType> = CredentialSubject<SubjectType>
    >(
    type: CredentialType,
    subject: CredentialSubjectProperty<Subject>,
    holder?: string,
  ) => Promise<UnsignedCredentail<Subject>>


export type SignCredentialMethod =
  (
    credential: UnsignedCredentail,
    issuer?: string,
    options?: SignCredentialOptions
  ) => Promise<Credential>

export type SignCredentialOptions = {
  key?:  boolean | string | KeyPair | Credential,
  password?: string,
  rotation?: number
  controllerRole?: ControllerRole
}

export type CredentialSubjectProperty<Type extends CredentialSubject = CredentialSubject>
  = Type

export type CredentialSubject<SubjectType extends CredentialSubjectType = CredentialSubjectType> =
  CommonCredentailSubject<SubjectType> & {}

export type CredentialSubjectType = CommonSubjectType & {}

export type UnsignedCredentail<
  Subject extends CredentialSubject = CredentialSubject
  > = CommonUnsignedCredential<Subject> & {}

export type CredentialType = CommonType

export const ERROR_NO_HOLDER = 'ERROR_NO_HOLDER'
export const ERROR_NO_ISSUER = 'ERROR_NO_ISSUER'