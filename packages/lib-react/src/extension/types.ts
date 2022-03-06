import { CredentialWrapper, RegistryType } from "@owlmeans/regov-ssi-core"
import { EmptyProps } from "../common"

export type ExtensionItemPurpose = typeof EXTENSION_ITEM_PURPOSE_ITEM
  | typeof EXTENSION_ITEM_PURPOSE_ROUTE
  | typeof EXTENSION_ITEM_PURPOSE_DASHBOARD
  | typeof EXTENSION_ITEM_PURPOSE_DASHBOARD_WIDGET
  | typeof EXTENSION_ITEM_PURPOSE_EVIDENCE
  | typeof EXTENSION_ITEM_PURPOSE_VALIDATION
  | typeof EXTENSION_ITEM_PURPOSE_CREATION
  | typeof EXTENSION_ITEM_PURPOSE_REQUEST
  | string

export const EXTENSION_ITEM_PURPOSE_ITEM = 'item'
export const EXTENSION_ITEM_PURPOSE_ROUTE = 'route'
export const EXTENSION_ITEM_PURPOSE_DASHBOARD = 'dashboard'
export const EXTENSION_ITEM_PURPOSE_DASHBOARD_WIDGET = 'dashboard_widget'
export const EXTENSION_ITEM_PURPOSE_EVIDENCE = 'evidence'
export const EXTENSION_ITEM_PURPOSE_VALIDATION = 'validation'
export const EXTENSION_ITEM_PURPOSE_CREATION = 'creation'
export const EXTENSION_ITEM_PURPOSE_REQUEST = 'request'



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
  trigger?: boolean
  meta?: ListItemMeta
}

export type ListItemMeta = {
  id: string
  registry: RegistryType
  section: string
}

export type PurposeEvidenceWidgetParams = EmptyProps & {
  wrapper: CredentialWrapper
}

export type PurposeCredentialCreationParams = EmptyProps & {
  next: () => void
}

export type PurposeDashboardWidgetParams = EmptyProps & {

}