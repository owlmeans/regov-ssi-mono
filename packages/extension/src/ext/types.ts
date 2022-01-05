import { CryptoKey, MaybeArray } from '@owlmeans/regov-ssi-common'
import {
  Presentation,
  UnsignedCredential,
  WalletWrapper,
  Evidence,
  CredentialSchema,
  CredentialType,
  MultiSchema
} from '@owlmeans/regov-ssi-core'
import { DIDDocumentUnsinged } from '@owlmeans/regov-ssi-did'

import {
  CredentialDescription,
  ExtensionEvent,
  ExtensionSchema
} from "../schema"


export type Extension<CredType extends string> = {
  schema: ExtensionSchema<CredType>
  factories: ExtensionFactories<CredType>
  localization?: ExtensionLocalization
  getEvents: (trigger: string, code?: string) => ExtensionEvent<CredType>[]
}

export type ExtensionFactories<CredType extends string> = {
  [key in CredType]: CredentialExtensionFactories
}

export type CredentialExtensionFactoriesBuilder = {
  buildingFactory?: BuildingFactoryMethodBuilder
}

export type CredentialExtensionFactories = {
  buildingFactory: BuildingFactoryMethod
  claimingFactory?: <
    Schema extends CredentialSchema = CredentialSchema,
    >(schema: CredentialDescription<Schema>) =>
    <Params>(wallet: WalletWrapper, params: Params) => Promise<Presentation>
  offeringFactory?: <
    Schema extends CredentialSchema = CredentialSchema,
    >(schema: CredentialDescription<Schema>) =>
    <Params>(wallet: WalletWrapper, params: Params) => Promise<Presentation>
  signingFactory?: <
    Schema extends CredentialSchema = CredentialSchema,
    >(schema: CredentialDescription<Schema>) =>
    <Params>(wallet: WalletWrapper, params: Params) => Promise<Credential>
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

export type BuildingFactoryMethod = <Params extends BuildingFactoryParams>(wallet: WalletWrapper, params: Params) =>
  Promise<UnsignedCredential>

export type BuildingFactoryParams = {
  didUnsigned?: DIDDocumentUnsinged
  subjectData: Object
  key?: CryptoKey
  evidence?: MaybeArray<Evidence>
  type?: CredentialType
  schema?: MaybeArray<CredentialSchema>
  context?: MultiSchema
}

export type ExtensionLocalization = {
  ns: string,
  translations: { [key: string]: Object }
}