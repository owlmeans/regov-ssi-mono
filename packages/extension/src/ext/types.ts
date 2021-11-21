import {
  UnsignedCredential,
  WalletWrapper
} from '@owlmeans/regov-ssi-core'

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
  buildingFactory?: <
    Evidance extends {} = any, Schema extends {} = any,
    >(schema: CredentialSchema<Evidance, Schema>) =>
    <Params>(wallet: WalletWrapper, params: Params) => Promise<UnsignedCredential>
}


export type FlowStateMethod = () => void


export type ExtensionLocalization = {
  ns: string,
  translations: { [key: string]: Object }
}