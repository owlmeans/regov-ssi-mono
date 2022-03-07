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

import { CryptoKey, MaybeArray } from '../../common'
import {
  Presentation, Credential, UnsignedCredential, Evidence, CredentialSchema,
  CredentialType, MultiSchema, BasicCredentialType
} from '../../vc'
import { WalletWrapper } from '../../wallet'
import { DIDDocument, DIDDocumentUnsinged } from '../../did'
import { ExtensionRegistry } from '../registry'
import {
  CredentialDescription, CredentialEvidenceDesctiption, ExtensionEvent, ExtensionSchema
} from "../schema"


export type Extension = {
  schema: ExtensionSchema
  factories: ExtensionService
  localization?: ExtensionLocalization
  getFactory: (type: BasicCredentialType, defaultType?: string) => CredentialService
  getEvents: (trigger: string, code?: string) => ExtensionEvent[]
  getEvent: (trigger: string, code?: string) => undefined | ExtensionEvent
  modifyEvent: (
    triggr: string, param: keyof ExtensionEvent, value: ExtensionEvent[typeof param], code?: string
  ) => void
}

export type ExtensionService = {
  [key: string]: CredentialService
}

export type ExtensionServiceBuilder = {
  [key: string]: CredentialServiceBuilder
}

export type CredentialServiceBuilder = {
  produceBuildMethod?: BuildMethodBuilder
  produceSignMethod?: SignMethodBuilder
  produceValidateMethod?: ValidateMethodBuilder
  produceClaimMethod?: ClaimMethodBuilder
  produceOfferMethod?: OfferMethodBuilder
  produceRequestMethod?: RequestMethodBuilder
  produceRespondMethod?: RespondMethodBuilder
}

export type CredentialService = {
  build: BuildMethod
  sign: SignMethod
  validate: ValidateMethod
  claim: ClaimMethod
  offer: OfferMethod
  request: RequestMethod
  respond: RespondMethod
}


export type BuildMethodBuilder = <
  Schema extends CredentialSchema = CredentialSchema,
  >(schema: CredentialDescription<Schema>) => BuildMethod

export type BuildMethod = <
  Params extends BuildMethodParams
  >(wallet: WalletWrapper, params: Params) => Promise<UnsignedCredential>

export type BuildMethodParams = {
  didUnsigned?: DIDDocumentUnsinged
  subjectData: Object
  key?: CryptoKey
  evidence?: MaybeArray<Evidence>
  identity?: Credential
  type?: CredentialType
  schema?: MaybeArray<CredentialSchema>
  context?: MultiSchema
}

export type SignMethodBuilder = <
  Schema extends CredentialSchema = CredentialSchema,
  >(schema: CredentialDescription<Schema>) => SignMethod

export type SignMethod = <
  Params extends SignMethodParams
  >(wallet: WalletWrapper, params: Params) => Promise<Credential>

export type SignMethodParams = {
  unsigned: UnsignedCredential,
  evidence?: MaybeArray<Evidence>
}

export type ValidateMethodBuilder = <
  Schema extends CredentialSchema = CredentialSchema
  >(schema: CredentialDescription<Schema>) => ValidateMethod

export type ValidateMethod = <
  Params extends ValidateMethodParams
  >(wallet: WalletWrapper, params: Params) => Promise<ValidationResult>

export type ValidateMethodParams = {
  presentation?: Presentation
  credential: Credential
  extensions: ExtensionRegistry
  kind?: ValidationKind
}

export type ValidationKind = undefined
  | typeof VALIDATION_KIND_RESPONSE
  | typeof VALIDATION_KIND_OFFER

export const VALIDATION_KIND_RESPONSE = 'response'
export const VALIDATION_KIND_OFFER = 'offer'

export interface ValidationResult {
  valid: boolean
  trusted: boolean
  cause?: MaybeArray<string | ValidationErrorCause>
  evidence: MaybeArray<EvidenceValidationResult>
  instance?: Credential
}

export type ValidationErrorCause = {
  kind?: string
  message?: string
}

export interface EvidenceValidationResult {
  type: MaybeArray<string>
  result: ValidationResult
  instance?: Credential
  schema?: CredentialEvidenceDesctiption
  trustCredential?: Credential[]
}

export type ClaimMethodBuilder = <
  Schema extends CredentialSchema = CredentialSchema
  >(schema: CredentialDescription<Schema>) => ClaimMethod

export type ClaimMethod = <
  Params extends ClaimMethodParams
  >(wallet: WalletWrapper, params: Params) => Promise<Presentation>

export type ClaimMethodParams = {
  unsignedClaim: UnsignedCredential
  holder?: DIDDocument
  claimType?: string
  identity?: Credential
}

export type RequestMethodBuilder = <
  Schema extends CredentialSchema = CredentialSchema
  >(schema: CredentialDescription<Schema>) => RequestMethod

export type RequestMethod = <
  Params extends RequestMethodParams
  >(wallet: WalletWrapper, params: Params) => Promise<Presentation>

export type RequestMethodParams = {
  unsignedRequest: UnsignedCredential
  holder?: DIDDocument
  requestType?: string
  identity?: Credential
}

export type OfferMethodBuilder = <
  Schema extends CredentialSchema = CredentialSchema,
  >(schema: CredentialDescription<Schema>) => OfferMethod

export type OfferMethod = <
  Params extends OfferMethodParams
  >(wallet: WalletWrapper, params: Params) => Promise<Presentation>

export type OfferMethodParams = {
  claim: Presentation
  credential: Credential
  holder: DIDDocument
  cryptoKey: CryptoKey
  subject: Object
  claimType?: string
  offerType?: string
  id: string,
  challenge: string
  domain: string
}

export type RespondMethodBuilder = <
  Schema extends CredentialSchema = CredentialSchema,
  >(schema: CredentialDescription<Schema>) => RespondMethod

export type RespondMethod = <
  Params extends RespondMethodParams
  >(wallet: WalletWrapper, params: Params) => Promise<Presentation>

export type RespondMethodParams = {
  request: Presentation
  credential: Credential
  identity?: Credential
}

export type ExtensionLocalization = {
  ns: string,
  translations: { [key: string]: Object }
}

export const VALIDATION_FAILURE_CHECKING = 'checking'