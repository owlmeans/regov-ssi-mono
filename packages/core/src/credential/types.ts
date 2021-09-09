import { CommonContextType } from "./context/types"
import {
  CommonCredentail,
  CommonCredentailSubject,
  CommonSubjectType,
  CommonType,
  CommonUnsignedCredential
} from "./context/types/credential"
import { CommonPresentation, CommonPresentationHolder, CommonPresentationType, CommonUnsignedPresentation } from "./context/types/presentation"


export type Credential<Subject extends CredentialSubject = CredentialSubject>
  = CommonCredentail<Subject> & {}

export type Identity<Subject extends IdentitySubject = IdentitySubject>
  = {} & Credential<Subject>

export type IdentitySubject<Type extends CredentialSubjectType = CredentialSubjectType> = CredentialSubject<Type>

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

export type UnsignedPresentation<
  C extends Credential = Credential,
  H extends PresentationHolder = PresentationHolder,
  > = CommonUnsignedPresentation<C, H>

export type Presentation<
  C extends Credential = Credential,
  H extends PresentationHolder = PresentationHolder
  > = CommonPresentation<C, H>

export type PresentationHolder = CommonPresentationHolder

export type PresentationType = CommonPresentationType