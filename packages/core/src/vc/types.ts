/**
 *  Copyright 2022 OwlMeans
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import {
  SimpleThing, TContext, VCV1, VCV1Subject, VCV1Type, VCV1Unsigned, VPV1, VPV1Holder, VPV1Type,
  VPV1Unsigned, ContextObj, VCV1Holder
} from "@affinidi/vc-common"
import { Validatied as AffinidiValidatied } from "@affinidi/vc-common/dist/verifier/util"
import { MaybeArray } from "../common"
import { DIDDocument, DIDDocumentUnsinged } from "../did"


export type Validated<T> = AffinidiValidatied<T>

export type ContextSchema = ContextObj

export type MultiSchema = MaybeArray<ContextSchema>

export type Credential<Subject extends MaybeArray<CredentialSubject> = MaybeArray<CredentialSubject>>
  = VCV1<Subject> & {
    holder: CredentialHolder
    evidence?: MaybeArray<Evidence>
    credentialSchema?: MaybeArray<CredentialSchema>
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
    credentialSchema?: MaybeArray<CredentialSchema>
  }

export type CredentialSchema = FullCredentialSchema | PartialCredentialSchema

export interface FullCredentialSchema extends Credential {

}

export type PartialCredentialSchema = {
  id: string
  type: CredentialType
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
    verifiableCredential: MaybeArray<CredentialT>
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
export const SUBJECT_ONLY_CREDENTIAL_SCHEMA_TYPE = 'SubjectOnlyCredentialSchemaType'

export const ERROR_INVALID_PRESENTATION = 'ERROR_INVALID_PRESENTATION'
export const ERROR_INVALID_EVIDENCE = 'ERROR_INVALID_EVIDENCE'
export const ERROR_EVIDENCE_ISNT_TRUSTED = 'ERROR_EVIDENCE_ISNT_TRUSTED'
export const ERROR_EVIDENCE_ISNT_CREDENTIAL = 'ERROR_EVIDENCE_ISNT_CREDENTIAL'

export const ERROR_CREDENTAILSCHEMA_ISNT_SUPPORTED = 'ERROR_CREDENTAILSCHEMA_ISNT_SUPPORTED'
export const ERROR_CREDENTAILSCHEMA_UNKNOWN_ERROR = 'ERROR_CREDENTAILSCHEMA_UNKNOWN_ERROR'