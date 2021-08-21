import { CommonContextType } from "./context/types"
import { CommonCredentail, CommonCredentailSubject, CommonSubjectType, CommonType, CommonUnsignedCredential } from "./context/types/credential"


export type Credential<Subject extends CredentialSubject = CredentialSubject>
  = CommonCredentail<Subject> & {}

export type Identity<Subject extends IdentitySubect = IdentitySubect>
  = {} & Credential<Subject>

export type IdentitySubect<Type extends CredentialSubjectType = CredentialSubjectType> = CredentialSubject<Type>

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