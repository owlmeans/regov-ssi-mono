/**
 *  Copyright 2022 OwlMeans
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { CredentialDescription, CredentialWrapper, RegistryType } from "@owlmeans/regov-ssi-core"
import { EmptyProps, WalletNavigator, BasicNavigator } from "../common"

export type ExtensionItemPurpose = typeof EXTENSION_ITEM_PURPOSE_ITEM
  | typeof EXTENSION_ITEM_PURPOSE_ROUTE
  | typeof EXTENSION_ITEM_PURPOSE_DASHBOARD
  | typeof EXTENSION_ITEM_PURPOSE_DASHBOARD_WIDGET
  | typeof EXTENSION_ITEM_PURPOSE_EVIDENCE
  | typeof EXTENSION_ITEM_PURPOSE_VALIDATION
  | typeof EXTENSION_ITEM_PURPOSE_CREATION
  | typeof EXTENSION_ITEM_PURPOSE_REQUEST
  | typeof EXTENSION_ITEM_PURPOSE_TOP_ACTION
  | typeof EXRENSION_ITEM_PURPOSE_INPUT_ITEM
  | string

export const EXTENSION_ITEM_PURPOSE_ITEM = 'item'
export const EXRENSION_ITEM_PURPOSE_INPUT_ITEM = 'input:item'
export const EXRENSION_ITEM_PURPOSE_INPUT_DETAILS = 'input:details'
export const EXTENSION_ITEM_PURPOSE_ROUTE = 'route'
export const EXTENSION_ITEM_PURPOSE_DASHBOARD = 'dashboard'
export const EXTENSION_ITEM_PURPOSE_DASHBOARD_WIDGET = 'dashboard_widget'
export const EXTENSION_ITEM_PURPOSE_EVIDENCE = 'evidence'
export const EXTENSION_ITEM_PURPOSE_VALIDATION = 'validation'
export const EXTENSION_ITEM_PURPOSE_CREATION = 'creation'
export const EXTENSION_ITEM_PURPOSE_REQUEST = 'request'
export const EXTENSION_ITEM_PURPOSE_CLAIM = 'claim'
export const EXTENSION_ITEM_PURPOSE_TOP_ACTION = 'top_action'



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

export type ClaimNavigator = WalletNavigator<ClaimNavigatorParams> & BasicNavigator

export type ClaimNavigatorParams = {
  path?: string
  descr: CredentialDescription
  id?: string
  issuer?: string
}