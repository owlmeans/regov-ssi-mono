import { CryptoKey } from '@owlmeans/regov-ssi-common'
import {
  Presentation,
  UnsignedCredential,
  WalletWrapper
} from '@owlmeans/regov-ssi-core'
import { DIDDocumentUnsinged } from '@owlmeans/regov-ssi-did'

import {
  CredentialSchema,
  ExtensionSchema
} from "../schema"


export type Extension<
  CredType extends string,
  FlowType extends string | undefined = undefined
  > = {
    schema: ExtensionSchema<CredType, FlowType>
    flowStateMap?: {
      [key: string]: FlowStateMethod
    }
    localization?: ExtensionLocalization
  } & ExtensionFactories

export type ExtensionFactories = {
  buildingFactory?: BuildingFactoryMethod
  claimingFactory?: <
    Evidance extends {} = any, Schema extends {} = any,
    >(schema: CredentialSchema<Evidance, Schema>) =>
    <Params>(wallet: WalletWrapper, params: Params) => Promise<Presentation>
  offeringFactory?: <
    Evidance extends {} = any, Schema extends {} = any,
    >(schema: CredentialSchema<Evidance, Schema>) =>
    <Params>(wallet: WalletWrapper, params: Params) => Promise<Presentation>
  signingFactory?: <
    Evidance extends {} = any, Schema extends {} = any,
    >(schema: CredentialSchema<Evidance, Schema>) =>
    <Params>(wallet: WalletWrapper, params: Params) => Promise<Credential>
  issuingFactory?: <
    Evidance extends {} = any, Schema extends {} = any,
    >(schema: CredentialSchema<Evidance, Schema>) =>
    <Params>(wallet: WalletWrapper, params: Params) => Promise<Credential>
  requestFactory?: <
    Evidance extends {} = any, Schema extends {} = any,
    >(schema: CredentialSchema<Evidance, Schema>) =>
    <Params>(wallet: WalletWrapper, params: Params) => Promise<Presentation>
  responseFactory?: <
    Evidance extends {} = any, Schema extends {} = any,
    >(schema: CredentialSchema<Evidance, Schema>) =>
    <Params>(wallet: WalletWrapper, params: Params) => Promise<Presentation>
  holdingFactory?: <
    Evidance extends {} = any, Schema extends {} = any,
    >(schema: CredentialSchema<Evidance, Schema>) =>
    <Params>(wallet: WalletWrapper, params: Params) => Promise<boolean>
}

export type BuildingFactoryMethod = <
  Evidance extends {} = any, Schema extends {} = any,
  >(schema: CredentialSchema<Evidance, Schema>) =>
  <Params extends BuildingFactoryParams>(wallet: WalletWrapper, params: Params) =>
    Promise<{ unsigned: UnsignedCredential, did: DIDDocumentUnsinged }>

export type BuildingFactoryParams = {
  didUnsigned?: DIDDocumentUnsinged
  subjectData: Object
  key?: CryptoKey
}

export type FlowStateMethod = () => void


export type ExtensionLocalization = {
  ns: string,
  translations: { [key: string]: Object }
}