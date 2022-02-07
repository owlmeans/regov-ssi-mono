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


export type Extension<CredType extends string> = {
  schema: ExtensionSchema<CredType>
  factories: ExtensionFactories<CredType>
  localization?: ExtensionLocalization
  getFactory: (type: BasicCredentialType, defaultType?: string) => CredentialExtensionFactories
  getEvents: (trigger: string, code?: string) => ExtensionEvent<CredType>[]
}

export type ExtensionFactories<CredType extends string> = {
  [key in CredType]: CredentialExtensionFactories
}

export type ExtensionFactoriesParam<CredType extends string> = {
  [key in CredType]: CredentialExtensionFactoriesBuilder
}

export type CredentialExtensionFactoriesBuilder = {
  buildingFactory?: BuildingFactoryMethodBuilder
  signingFactory?: SigningFactoryMethodBuilder
  validationFactory?: ValidationFactoryMethodBuilder
  claimingFactory?: ClaimingFactoryMethodBuilder
  offeringFacotry?: OfferingFactoryMethodBuilder
}

export type CredentialExtensionFactories = {
  buildingFactory: BuildingFactoryMethod
  signingFactory: SigningFactoryMethod
  validationFactory: ValidationFactoryMethod
  claimingFactory: ClaimingFactoryMethod
  offeringFactory: OfferingFactoryMethod
  issuingFactory?: <
    Schema extends CredentialSchema = CredentialSchema,
    >(schema: CredentialDescription<Schema>) =>
    <Params>(wallet: WalletWrapper, params: Params) => Promise<Credential>
  requestFactory?: <
    Schema extends CredentialSchema = CredentialSchema,
    >(schema: CredentialDescription<Schema>) =>
    <Params>(wallet: WalletWrapper, params: Params) => Promise<Presentation>
  responseFactory?: <
    Schema extends CredentialSchema = CredentialSchema,
    >(schema: CredentialDescription<Schema>) =>
    <Params>(wallet: WalletWrapper, params: Params) => Promise<Presentation>
  holdingFactory?: <
    Schema extends CredentialSchema = CredentialSchema,
    >(schema: CredentialDescription<Schema>) =>
    <Params>(wallet: WalletWrapper, params: Params) => Promise<boolean>
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
  credential: Credential
  extensions: ExtensionRegistry<string>
}

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
  type: string
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

export type ExtensionLocalization = {
  ns: string,
  translations: { [key: string]: Object }
}

export const VALIDATION_FAILURE_CHECKING = 'checking'