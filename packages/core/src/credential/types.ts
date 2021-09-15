import {
  MaybeArray as AffinidiMaybeArray,
  SimpleThing,
  TContext,
  VCV1,
  VCV1Subject,
  VCV1Type,
  VCV1Unsigned,
  VPV1,
  VPV1Holder,
  VPV1Type,
  VPV1Unsigned,
  ContextObj
} from "@affinidi/vc-common";

import { Validatied as AffinidiValidatied } from "@affinidi/vc-common/dist/verifier/util"

export type Validated<T> = AffinidiValidatied<T>

export type MaybeArray<T> = AffinidiMaybeArray<T>

export type ContextSchema = ContextObj

export type Credential<Subject extends MaybeArray<CredentialSubject> = MaybeArray<CredentialSubject>>
  = VCV1<Subject>

export type Identity<Subject extends MaybeArray<IdentitySubject> = MaybeArray<IdentitySubject>>
  = Credential<Subject>

export type IdentitySubject<
  Type extends WrappedDocument = WrappedDocument,
  ExtendedType extends {} = {}
  > = CredentialSubject<Type, ExtendedType>

export type CredentialSubjectProperty<Type extends CredentialSubject = CredentialSubject>
  = Type

export type CredentialSubject<
  SubjectType extends WrappedDocument = WrappedDocument,
  ExtendedType extends {} = {}
  > = VCV1Subject<SubjectType> & ExtendedType

export type WrappedDocument<ExtendedData extends {} = {}> = SimpleThing & ExtendedData

export type CredentialContextType = TContext

export type UnsignedCredential<
  Subject extends MaybeArray<CredentialSubject> = MaybeArray<CredentialSubject>
  > = VCV1Unsigned<Subject>

export type CredentialType = VCV1Type

export type UnsignedPresentation<
  CredentialT extends Credential = Credential,
  Holder extends PresentationHolder = PresentationHolder,
  > = VPV1Unsigned<CredentialT, PresentationType, Holder>


export type Presentation<
  CredentialT extends Credential = Credential,
  Holder extends PresentationHolder = PresentationHolder
  > = VPV1<CredentialT, PresentationType, Holder>

export type PresentationHolder = VPV1Holder

export type PresentationType = VPV1Type

export const BASE_CREDENTIAL_TYPE = 'VerifiableCredential'
export const BASE_PRESENTATION_TYPE = 'VerifiablePresentation'

export const ERROR_INVALID_PRESENTATION = 'ERROR_INVALID_PRESENTATION'