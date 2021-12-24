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
  ContextObj,
  VCV1Holder
} from "@affinidi/vc-common";

import { Validatied as AffinidiValidatied } from "@affinidi/vc-common/dist/verifier/util"
import { DIDDocument, DIDDocumentUnsinged } from "@owlmeans/regov-ssi-did";

export type Validated<T> = AffinidiValidatied<T>

export type MaybeArray<T> = AffinidiMaybeArray<T>

export type ContextSchema = ContextObj

export type MultiSchema = ContextSchema | ContextSchema[]

export type Credential<Subject extends MaybeArray<CredentialSubject> = MaybeArray<CredentialSubject>>
  = VCV1<Subject> & {
    holder: CredentialHolder
    evidence?: MaybeArray<Evidence>
  }

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
  > = VCV1Unsigned<Subject> & {
    holder: CredentialHolder
    evidence?: MaybeArray<Evidence>
  }



export type Evidence = FullCrednetialEvidnce | PartialCredentialEvidence

export interface FullCrednetialEvidnce extends Credential {
}

export type PartialCredentialEvidence = {
  id: string
  type: CredentialType
}

export type CredentialType = VCV1Type

export type BasicCredentialType = string | string[]

export type UnsignedPresentation<
  CredentialT extends Credential = Credential,
  Holder extends PresentationHolder = PresentationHolder,
  > = VPV1Unsigned<CredentialT, PresentationType> & {
    hodler: Holder
  }

export type Presentation<
  CredentialT extends Credential = Credential,
  Holder extends PresentationHolder = PresentationHolder
  > = VPV1<CredentialT, PresentationType> & {
    holder: Holder
  }

/**
 * @TODO it can't be used properly because Affinidy takes only objects as this property
 */
export type CredentialHolder = VCV1Holder | DIDDocument | DIDDocumentUnsinged | string

export type PresentationHolder = VPV1Holder | DIDDocument | DIDDocumentUnsinged | string

export type PresentationType = VPV1Type

export const BASE_CREDENTIAL_TYPE = 'VerifiableCredential'
export const BASE_PRESENTATION_TYPE = 'VerifiablePresentation'

export const ERROR_INVALID_PRESENTATION = 'ERROR_INVALID_PRESENTATION'