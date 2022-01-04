import { MaybeArray } from "@owlmeans/regov-ssi-common"
import {
  BasicCredentialType,
  CredentialSchema,
  MultiSchema,
  Evidence,
  WalletWrapper
} from "@owlmeans/regov-ssi-core"
import { Extension } from "../ext"


export type ExtensionSchema<
  CredType extends string,
  FlowType extends string | undefined = undefined
  > = FlowType extends string ? {
    flows: { [key in FlowType]: ExtensionFlow }
    events: ExtensionEvent<FlowType>[]
  } & BasicExtensionFields<CredType>
  : BasicExtensionFields<CredType>

type BasicExtensionFields<CredType extends string> = {
  details: ExtensionDetails
  credentials: { [key in CredType]: CredentialDescription }
}

export type ExtensionDetails = {
  name: string
  code: string
  types?: ExtensionTypes
  organization?: string
  home?: string
  schemaBaseUrl?: string
}

export type ExtensionTypes = {
  claim?: string
  offer?: string
}

export type CredentialDescription<
  Schema extends CredentialSchema = CredentialSchema
  > = {
    defaultNameKey?: string
    mainType: string
    mandatoryTypes?: BasicCredentialType
    credentialContext: MultiSchema
    contextUrl?: string
    evidence?: BasicCredentialType | BasicCredentialType[]
    credentialSchema?: Schema | Schema[]
    registryType?: string
    claimable?: boolean
    listed?: boolean
    selfIssuing?: boolean
  }

export type ExtensionEvent<
  FlowType extends string
  > = {
    filter?: ExtensionEventFilter
    trigger: MaybeArray<string>
    flow: FlowType
  }

export type EventParams<
  CredType extends string,
  FlowType extends string | undefined = undefined
  > = {
    ext?: Extension<CredType, FlowType>
    step?: string
    flow?: ExtensionFlow
  }

export type ExtensionEventFilter = (wallet: WalletWrapper) => Promise<boolean>

export type ExtensionFlow = {
  code: string
  initialStep: string
  steps: { [key: string]: ExtensionFlowStep }
}

export type ExtensionFlowStep = {
  previous?: string
  next?: string
  stateMethod: string
}


export type ExtensionItemPurpose = typeof EXTENSION_ITEM_PURPOSE_CLAIM
  | typeof EXTENSION_ITEM_PURPOSE_OFFER
  | typeof EXTENSION_ITEM_PURPOSE_ISSUE
  | typeof EXTENSION_ITEM_PURPOSE_REQUEST
  | typeof EXTENSION_ITEM_PURPOSE_RESPONSE
  | typeof EXTENSION_ITEM_PURPOSE_VERIFY
  | typeof EXTENSION_ITEM_PURPOSE_STORE
  | typeof EXTENSION_ITEM_PURPOSE_CUSTOM
  | typeof EXTENSION_ITEM_PURPOSE_ROUTE
  | string

export const EXTENSION_ITEM_PURPOSE_CLAIM = 'claim'
export const EXTENSION_ITEM_PURPOSE_OFFER = 'offer'
export const EXTENSION_ITEM_PURPOSE_ISSUE = 'issue'
export const EXTENSION_ITEM_PURPOSE_REQUEST = 'request'
export const EXTENSION_ITEM_PURPOSE_RESPONSE = 'response'
export const EXTENSION_ITEM_PURPOSE_VERIFY = 'verify'
export const EXTENSION_ITEM_PURPOSE_STORE = 'store'
export const EXTENSION_ITEM_PURPOSE_CUSTOM = 'custom'
export const EXTENSION_ITEM_PURPOSE_ROUTE = 'route'

export const EXTESNION_TRIGGER_AUTHENTICATION = 'wallet:authentication'
export const EXTESNION_TRIGGER_AUTHENTICATED = 'wallet:authenticated'