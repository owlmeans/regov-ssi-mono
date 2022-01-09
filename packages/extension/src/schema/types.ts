import { MaybeArray } from "@owlmeans/regov-ssi-common"
import {
  BasicCredentialType,
  CredentialSchema,
  MultiSchema,
  WalletWrapper,
  CredentialSubject
} from "@owlmeans/regov-ssi-core"
import { Extension } from "../ext"


export type ExtensionSchema<CredType extends string> = {
  details: ExtensionDetails
  credentials?: { [key in CredType]: CredentialDescription }
  events?: ExtensionEvent<CredType>[]
}

export type ExtensionDetails = {
  name: string
  code: string
  defaultCredType?: string
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
  Schema extends CredentialSchema = CredentialSchema,
  Subject extends CredentialSubject = CredentialSubject
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
    defaultSubject?: Subject
  }

export type ExtensionEvent<CredType extends string> = {
  trigger: MaybeArray<string>
  code?: string
  filter?: ExtensionEventFilter<CredType>
  method?: EventObserverMethod<CredType>
}

export type EventObserverMethod<CredType extends string> = (
  wallet: WalletWrapper,
  params: EventParams<CredType>
) => Promise<boolean | undefined | void>

export type EventParams<CredType extends string> = {
  ext?: Extension<CredType>
}

export type ExtensionEventFilter<CredType extends string> =
  (wallet: WalletWrapper, params: EventParams<CredType>) => Promise<boolean>


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