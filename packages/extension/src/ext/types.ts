import { CryptoKey, MaybeArray } from '@owlmeans/regov-ssi-common'
import {
  Presentation,
  Credential,
  UnsignedCredential,
  WalletWrapper,
  Evidence,
  CredentialSchema,
  CredentialType,
  MultiSchema,
  BasicCredentialType,
} from '@owlmeans/regov-ssi-core'
import { DIDDocument, DIDDocumentUnsinged } from '@owlmeans/regov-ssi-did'
import { ExtensionRegistry } from '../registry'

import {
  CredentialDescription,
  CredentialEvidenceDesctiption,
  ExtensionEvent,
  ExtensionSchema
} from "../schema"


export type Extension = {
  schema: ExtensionSchema
  factories: ExtensionFactories
  localization?: ExtensionLocalization
  getFactory: (type: BasicCredentialType, defaultType?: string) => CredentialExtensionFactories
  getEvents: (trigger: string, code?: string) => ExtensionEvent[]
  getEvent: (trigger: string, code?: string) => undefined | ExtensionEvent
  modifyEvent: (
    triggr: string, param: keyof ExtensionEvent, value: ExtensionEvent[typeof param], code?: string
  ) => void
}

export type ExtensionFactories = {
  [key: string]: CredentialExtensionFactories
}

export type ExtensionFactoriesParam = {
  [key: string]: CredentialExtensionFactoriesBuilder
}

export type CredentialExtensionFactoriesBuilder = {
  buildingFactory?: BuildingFactoryMethodBuilder
  signingFactory?: SigningFactoryMethodBuilder
  validationFactory?: ValidationFactoryMethodBuilder
  claimingFactory?: ClaimingFactoryMethodBuilder
  offeringFacotry?: OfferingFactoryMethodBuilder
  requestFactory?: RequestFactoryMethodBuilder
  responseFactory?: ResponseFactoryMethodBuilder
}

export type CredentialExtensionFactories = {
  buildingFactory: BuildingFactoryMethod
  signingFactory: SigningFactoryMethod
  validationFactory: ValidationFactoryMethod
  claimingFactory: ClaimingFactoryMethod
  offeringFactory: OfferingFactoryMethod
  requestFactory: RequestFactoryMethod
  responseFactory: ResponseFactoryMethod
}


export type BuildingFactoryMethodBuilder = <
  Schema extends CredentialSchema = CredentialSchema,
  >(schema: CredentialDescription<Schema>) => BuildingFactoryMethod

export type BuildingFactoryMethod = <
  Params extends BuildingFactoryParams
  >(wallet: WalletWrapper, params: Params) => Promise<UnsignedCredential>

export type BuildingFactoryParams = {
  didUnsigned?: DIDDocumentUnsinged
  subjectData: Object
  key?: CryptoKey
  evidence?: MaybeArray<Evidence>
  identity?: Credential
  type?: CredentialType
  schema?: MaybeArray<CredentialSchema>
  context?: MultiSchema
}

export type SigningFactoryMethodBuilder = <
  Schema extends CredentialSchema = CredentialSchema,
  >(schema: CredentialDescription<Schema>) => SigningFactoryMethod

export type SigningFactoryMethod = <
  Params extends SigningFactoryParams
  >(wallet: WalletWrapper, params: Params) => Promise<Credential>

export type SigningFactoryParams = {
  unsigned: UnsignedCredential,
  evidence?: MaybeArray<Evidence>
}

export type ValidationFactoryMethodBuilder = <
  Schema extends CredentialSchema = CredentialSchema
  >(schema: CredentialDescription<Schema>) => ValidationFactoryMethod

export type ValidationFactoryMethod = <
  Params extends ValidationFactoryParams
  >(wallet: WalletWrapper, params: Params) => Promise<ValidationResult>

export type ValidationFactoryParams = {
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

export type ClaimingFactoryMethodBuilder = <
  Schema extends CredentialSchema = CredentialSchema
  >(schema: CredentialDescription<Schema>) => ClaimingFactoryMethod

export type ClaimingFactoryMethod = <
  Params extends ClaimingFactoryParams
  >(wallet: WalletWrapper, params: Params) => Promise<Presentation>

export type ClaimingFactoryParams = {
  unsignedClaim: UnsignedCredential
  holder?: DIDDocument
  claimType?: string
  identity?: Credential
}

export type RequestFactoryMethodBuilder = <
  Schema extends CredentialSchema = CredentialSchema
  >(schema: CredentialDescription<Schema>) => RequestFactoryMethod

export type RequestFactoryMethod = <
  Params extends RequestFactoryParams
  >(wallet: WalletWrapper, params: Params) => Promise<Presentation>

export type RequestFactoryParams = {
  unsignedRequest: UnsignedCredential
  holder?: DIDDocument
  requestType?: string
  identity?: Credential
}

export type OfferingFactoryMethodBuilder = <
  Schema extends CredentialSchema = CredentialSchema,
  >(schema: CredentialDescription<Schema>) => OfferingFactoryMethod

export type OfferingFactoryMethod = <
  Params extends OfferingFactoryParams
  >(wallet: WalletWrapper, params: Params) => Promise<Presentation>

export type OfferingFactoryParams = {
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

export type ResponseFactoryMethodBuilder = <
  Schema extends CredentialSchema = CredentialSchema,
  >(schema: CredentialDescription<Schema>) => ResponseFactoryMethod

export type ResponseFactoryMethod = <
  Params extends ResponseFactoryParams
  >(wallet: WalletWrapper, params: Params) => Promise<Presentation>

export type ResponseFactoryParams = {
  request: Presentation
  credential: Credential
  identity?: Credential
}

export type ExtensionLocalization = {
  ns: string,
  translations: { [key: string]: Object }
}

export const VALIDATION_FAILURE_CHECKING = 'checking'