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

import { MaybeArray } from "../common"
import { DIDDocument, DIDDocumentUnsinged } from "../did"


type ValidatiedSuccess<T> = {
  kind: 'valid'
  data: T
}

type ErrorConfig = {
  kind: string
  message: string
}

type ValidatiedInvalid = {
  kind: 'invalid'
  errors: ErrorConfig[]
}

export type Validated<T> = ValidatiedSuccess<T> | ValidatiedInvalid

export type ContextObjDetailedItem = {
  [key: string]: undefined | string | Record<string, unknown>
  '@id': string
  '@type'?: string
}

export type ContextSchema = {
  [key: string]: undefined | number | string | ContextObjDetailedItem
  '@version'?: number
  '@base'?: string
  '@vocab'?: string
}

export type MultiSchema = MaybeArray<ContextSchema>

export type Credential<Subject extends MaybeArray<{}> = MaybeArray<{}>> = UnsignedCredential<Subject> & {
  issuer: CredentialHolder
  proof: Proof
}

export type Proof = {
  type: string
  created: string
  proofPurpose: string
  verificationMethod: string
  jws?: string
  proofValue?: string
  challenge?: string
  domain?: string
}

export type Identity<Subject extends MaybeArray<{}> = MaybeArray<{}>> = Credential<Subject>

export type CredentialContextType = string | ContextSchema | (string | ContextSchema)[]

export type UnsignedCredential<
  Subject extends MaybeArray<{}> = MaybeArray<{}>
> = {
  '@context': MultiSchema
  id: string
  type: CredentialType
  holder: CredentialHolder
  credentialSchema?: MaybeArray<CredentialSchema>
  evidence?: MaybeArray<Evidence>
  credentialSubject: Subject
  issuanceDate: string
  expirationDate?: string
  revocation?: Revocation
}

export type Revocation = {
  id: string
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

export type CredentialType = ['VerifiableCredential', ...string[]]

export type BasicCredentialType = string | string[]

export type UnsignedPresentation<CredentialT extends UnsignedCredential = Credential> = {
  '@context': MultiSchema
  id?: string
  type: PresentationType
  verifiableCredential: CredentialT[]
  holder: PresentationHolder
}

export type Presentation<CredentialT extends UnsignedCredential = Credential>
  = UnsignedPresentation<CredentialT> & {
    proof: Proof
  }

/**
 * @TODO it can't be used properly because Affinidy takes only objects as this property
 */
export type CredentialHolder = { id: string } | DIDDocument | DIDDocumentUnsinged | string

export type PresentationHolder = { id: string } | DIDDocument | DIDDocumentUnsinged | string

export type PresentationType = ['VerifiablePresentation', ...string[]]

export const BASE_CREDENTIAL_TYPE = 'VerifiableCredential'
export const BASE_PRESENTATION_TYPE = 'VerifiablePresentation'
export const SUBJECT_ONLY_CREDENTIAL_SCHEMA_TYPE = 'SubjectOnlyCredentialSchemaType'

export const ERROR_INVALID_PRESENTATION = 'ERROR_INVALID_PRESENTATION'
export const ERROR_INVALID_EVIDENCE = 'ERROR_INVALID_EVIDENCE'
export const ERROR_EVIDENCE_ISNT_TRUSTED = 'ERROR_EVIDENCE_ISNT_TRUSTED'
export const ERROR_EVIDENCE_ISNT_CREDENTIAL = 'ERROR_EVIDENCE_ISNT_CREDENTIAL'

export const ERROR_CREDENTIALSCHEMA_ISNT_SUPPORTED = 'ERROR_CREDENTIALSCHEMA_ISNT_SUPPORTED'
export const ERROR_CREDENTAILSCHEMA_UNKNOWN_ERROR = 'ERROR_CREDENTAILSCHEMA_UNKNOWN_ERROR'