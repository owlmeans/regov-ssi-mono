import { MaybeArray } from "@affinidi/vc-common"
import { CommonContextType } from "./context/types"
import {
  CommonCredential,
  CommonCredentailSubject,
  CommonSubjectType,
  CommonType,
  CommonUnsignedCredential
} from "./context/types/credential"
import { CommonPresentation, CommonPresentationHolder, CommonPresentationType, CommonUnsignedPresentation } from "./context/types/presentation"


export type Credential<Subject extends MaybeArray<CredentialSubject> = MaybeArray<CredentialSubject>>
  = CommonCredential<Subject>

export type Identity<Subject extends MaybeArray<IdentitySubject> = MaybeArray<IdentitySubject>>
  = Credential<Subject>

export type IdentitySubject<
  Type extends CredentialSubjectType = CredentialSubjectType,
  ExtendedType extends {} = {}
  >
  = CredentialSubject<Type, ExtendedType>

export type CredentialSubjectProperty<Type extends CredentialSubject = CredentialSubject>
  = Type

export type CredentialSubject<
  SubjectType extends CredentialSubjectType = CredentialSubjectType,
  ExtendedType extends {} = {}
  > =
  CommonCredentailSubject<SubjectType, ExtendedType>

export type CredentialSubjectType<ExtendedData extends {} = {}> = CommonSubjectType<ExtendedData>

export type CredentialContextType = CommonContextType & {}

export type UnsignedCredential<
  Subject extends MaybeArray<CredentialSubject> = MaybeArray<CredentialSubject>
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

export const BASE_CREDENTIAL_TYPE = 'VerifiableCredential'
export const BASE_PRESENTATION_TYPE = 'VerifiablePresentation'