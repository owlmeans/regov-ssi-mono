import { BasicCredentialType, MultiSchema } from "@owlmeans/regov-ssi-core"


export type ExtensionSchema<
  CredType extends string,
  FlowType extends string | undefined = undefined
  > = FlowType extends string ? {
    flows: { [key in FlowType]: ExtensionFlow }
    onboardings: ExtensionOnboarding<CredType, FlowType>[]
  } & BasicExtensionFields<CredType>
  : BasicExtensionFields<CredType>

type BasicExtensionFields<CredType extends string> = {
  details: ExtensionDetails
  credentials: { [key in CredType]: CredentialSchema }
}

export type ExtensionDetails = {
  name: string
  code: string
  organization?: string
  home?: string
  schemaBaseUrl?: string
}

export type CredentialSchema<
  Evidance extends {} = any,
  Schema extends {} = any
  > = {
    mainType: string
    credentialContext: MultiSchema
    contextUrl?: string
    mandatoryTypes?: BasicCredentialType
    evidence?: Evidance | Evidance[]
    credentialSchema?: Schema | Schema[]
    registryType?: string
    withSource?: boolean
    claimable?: boolean
    listed?: boolean
    selfIssuing?: boolean
  }

export type ExtensionOnboarding<
  CredType extends string,
  FlowType extends string
  > = {
    creds: CredType[]
    flow: FlowType
  }

export type ExtensionFlow = {
  type: string
  initialStep: ExtensionFlowStep
  steps: { [key: string]: ExtensionFlowStep }
}

export type ExtensionFlowStep = {
  previous?: string
  next?: string
  changeStateMethod?: string
  type: string
}


export type ExtensionItemPurpose = typeof EXTENSION_ITEM_PURPOSE_CLAIM
 | typeof EXTENSION_ITEM_PURPOSE_OFFER
 | typeof EXTENSION_ITEM_PURPOSE_ISSUE
 | typeof EXTENSION_ITEM_PURPOSE_REQUEST
 | typeof EXTENSION_ITEM_PURPOSE_RESPONSE
 | typeof EXTENSION_ITEM_PURPOSE_VERIFY
 | typeof EXTENSION_ITEM_PURPOSE_STORE
 | typeof EXTENSION_ITEM_PURPOSE_CUSTOM
 | typeof EXTENSION_ITEM_PURPOSE_MENU
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
export const EXTENSION_ITEM_PURPOSE_MENU = 'menu'
export const EXTENSION_ITEM_PURPOSE_ROUTE = 'route'