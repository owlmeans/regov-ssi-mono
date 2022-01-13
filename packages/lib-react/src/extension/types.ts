
export type ExtensionItemPurpose = typeof EXTENSION_ITEM_PURPOSE_CLAIM
| typeof EXTENSION_ITEM_PURPOSE_OFFER
| typeof EXTENSION_ITEM_PURPOSE_ISSUE
| typeof EXTENSION_ITEM_PURPOSE_REQUEST
| typeof EXTENSION_ITEM_PURPOSE_RESPONSE
| typeof EXTENSION_ITEM_PURPOSE_VERIFY
| typeof EXTENSION_ITEM_PURPOSE_STORE
| typeof EXTENSION_ITEM_PURPOSE_CUSTOM
| typeof EXTENSION_ITEM_PURPOSE_ROUTE
| typeof EXTENSION_ITEM_PURPOSE_DASHBOARD
| typeof EXTENSION_ITEM_PURPOSE_DASHBOARD_WIDGET
| typeof EXTENSION_ITEM_PURPOSE_SIGNER
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
export const EXTENSION_ITEM_PURPOSE_DASHBOARD = 'dashboard'
export const EXTENSION_ITEM_PURPOSE_DASHBOARD_WIDGET = 'dashboard_widget'
export const EXTENSION_ITEM_PURPOSE_SIGNER = 'signer'



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