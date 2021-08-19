import { CommonContextType } from "common/types"
import { CommonCredentail, CommonCredentailSubject, CommonSubjectType, CommonType, CommonUnsignedCredential } from "common/types/credential"


export type Credential<Subject extends CredentialSubject = CredentialSubject>
  = CommonCredentail<Subject> & UnsignedCredentail<Subject> & {}

export type Identity<Subject extends IdentitySubect = IdentitySubect>
  = {} & Credential<Subject>

export type IdentitySubect = {} & CredentialSubject

export type CredentialSubjectProperty<Type extends CredentialSubject = CredentialSubject>
  = Type

export type CredentialSubject<SubjectType extends CredentialSubjectType = CredentialSubjectType> =
  CommonCredentailSubject<SubjectType> & {}

export type CredentialSubjectType = CommonSubjectType & {}

export type CredentialContextType = CommonContextType & {}

export type UnsignedCredentail<
  Subject extends CredentialSubject = CredentialSubject
  > = CommonUnsignedCredential<Subject> & {}

export type CredentialType = CommonType