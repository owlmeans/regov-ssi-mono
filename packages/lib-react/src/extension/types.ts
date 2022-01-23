import { CredentialWrapper } from "@owlmeans/regov-ssi-core"
import { EmptyProps } from ".."

export type ExtensionItemPurpose = typeof EXTENSION_ITEM_PURPOSE_CLAIM
| typeof EXTENSION_ITEM_PURPOSE_OFFER
| typeof EXTENSION_ITEM_PURPOSE_ISSUE
| typeof EXTENSION_ITEM_PURPOSE_SELFISSUE
| typeof EXTENSION_ITEM_PURPOSE_BUILD
| typeof EXTENSION_ITEM_PURPOSE_REQUEST
| typeof EXTENSION_ITEM_PURPOSE_RESPONSE
| typeof EXTENSION_ITEM_PURPOSE_VERIFY
| typeof EXTENSION_ITEM_PURPOSE_LIST
| typeof EXTENSION_ITEM_PURPOSE_ITEM
| typeof EXTENSION_ITEM_PURPOSE_VIEW
| typeof EXTENSION_ITEM_PURPOSE_STORE
| typeof EXTENSION_ITEM_PURPOSE_CUSTOM
| typeof EXTENSION_ITEM_PURPOSE_ROUTE
| typeof EXTENSION_ITEM_PURPOSE_DASHBOARD
| typeof EXTENSION_ITEM_PURPOSE_DASHBOARD_WIDGET
| typeof EXTENSION_ITEM_PURPOSE_SIGNER
| typeof EXTENSION_ITEM_PURPOSE_EVIDENCE
| typeof EXTENSION_ITEM_PURPOSE_CREATION
| typeof EXTENSION_ITEM_PURPOSE_VALIDATION
| string

export const EXTENSION_ITEM_PURPOSE_CLAIM = 'claim'
export const EXTENSION_ITEM_PURPOSE_OFFER = 'offer'
export const EXTENSION_ITEM_PURPOSE_ISSUE = 'issue'
export const EXTENSION_ITEM_PURPOSE_SELFISSUE = 'selfissue'
export const EXTENSION_ITEM_PURPOSE_BUILD = 'build'
export const EXTENSION_ITEM_PURPOSE_REQUEST = 'request'
export const EXTENSION_ITEM_PURPOSE_RESPONSE = 'response'
export const EXTENSION_ITEM_PURPOSE_VERIFY = 'verify'
export const EXTENSION_ITEM_PURPOSE_LIST = 'list'
export const EXTENSION_ITEM_PURPOSE_ITEM = 'item'
export const EXTENSION_ITEM_PURPOSE_VIEW = 'view'
export const EXTENSION_ITEM_PURPOSE_STORE = 'store'
export const EXTENSION_ITEM_PURPOSE_CUSTOM = 'custom'
export const EXTENSION_ITEM_PURPOSE_ROUTE = 'route'
export const EXTENSION_ITEM_PURPOSE_DASHBOARD = 'dashboard'
export const EXTENSION_ITEM_PURPOSE_DASHBOARD_WIDGET = 'dashboard_widget'
export const EXTENSION_ITEM_PURPOSE_SIGNER = 'signer'
export const EXTENSION_ITEM_PURPOSE_EVIDENCE = 'evidence'
export const EXTENSION_ITEM_PURPOSE_VALIDATION = 'validation'
export const EXTENSION_ITEM_PURPOSE_CREATION = 'creation'



export type ManuItemParams = {
  title: string
  action: (() => Promise<void | MenuActionResult> | MenuActionResult | void)
  | MenuActionResult
  | string
  ns?: string
  order?: number
  menuTag?: string | string[]
}

export type MenuActionResult = { path: string, params?: Object }

export type PurposeListItemParams = EmptyProps & {
  wrapper: CredentialWrapper
}

export type PurposeEvidenceWidgetParams = EmptyProps & {
  wrapper: CredentialWrapper
}

export type PurposeCredentialCreationParams = EmptyProps & {
  next: () => void
}

export type PurposeDashboardWidgetParams = EmptyProps & {
  
}