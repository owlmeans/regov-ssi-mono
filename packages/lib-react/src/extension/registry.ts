/**
 *  Copyright 2023 OwlMeans
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

import { MaybeArray, normalizeValue } from "@owlmeans/regov-ssi-core"
import { WalletWrapper } from "@owlmeans/regov-ssi-core"
import {
  buildExtensionRegistry, CredentialDescription, ExtensionRegistry, EventParams
} from "@owlmeans/regov-ssi-core"
import { EmptyProps } from "../common"
import { MENU_TAG_MAIN } from "../component"
import { UIExtension, UIExtensionFactory } from "./extension"
import { ManuItemParams } from './types'


export const buildUIExtensionRegistry = (): UIExtensionRegistry => {
  const _typeToExtension: { [key: string]: UIExtension[] } = {}

  const _registry: UIExtensionRegistry = {
    registry: buildExtensionRegistry(),

    uiExtensions: [],

    getExtensions: (type) => {
      return _typeToExtension[type] || []
    },

    getExtension: (type, code?) => {
      const extModel = _registry.registry.getExtension(type, code)

      const ext = _registry.uiExtensions.find(ext => ext.extension === extModel)

      if (!ext) {
        throw ERROR_NO_UIEXTENSION
      }

      return ext
    },

    getExtensionByCode: (code) => {
      return _registry.uiExtensions.find(ext => ext.extension.schema.details.code === code)
    },

    registerAll: async exts => {
      await Promise.all(exts.map(async ext => _registry.register(ext)))
    },

    register: async ext => {
      _registry.registerSync(ext)
    },

    registerSync: ext => {
      _registry.registry.registerSync(ext.extension)
      _registry.uiExtensions.push(ext)
      if (ext.extension.schema.credentials) {
        Object.entries(ext.extension.schema.credentials).forEach(
          ([_, cred]: [string, CredentialDescription]) => {
            _typeToExtension[cred.mainType] = [
              ...(_typeToExtension[cred.mainType] ? _typeToExtension[cred.mainType] : []),
              ext
            ]
          }
        )
      }
    },

    produceComponent: <Type extends EmptyProps = EmptyProps>(
      purpose: string, type?: MaybeArray<string>
    ) => {
      if (type && Array.isArray(type)) {
        const types = normalizeValue(type)
        type = types.find(type => {
          return !!_typeToExtension[type]
        })
      }

      const wraps = type && _typeToExtension[type] ? _typeToExtension[type].flatMap(
        ext => ext.produceComponent<Type>(purpose, type as any)
      ) : _registry.uiExtensions.flatMap(
        ext => ext.produceComponent<Type>(purpose, type)
      )

      return wraps.sort((a, b) => {
        if (typeof a.order === 'number' && typeof b.order === 'number') {
          return a.order - b.order
        }
        if (typeof a.order === 'object' && typeof b.order === 'object') {
          if (a.order.after?.includes(b.extensionCode)) {
            return 1
          }
          if (a.order.before?.includes(b.extensionCode)) {
            return -1
          }
          if (b.order.after?.includes(a.extensionCode)) {
            return -1
          }
          if (b.order.before?.includes(a.extensionCode)) {
            return 1
          }
        }

        return 0
      })
    },

    triggerEvent: async (wallet, event, params) => {
      return _registry.registry.triggerEvent(wallet, event, params)
    },

    getMenuItems: (tag?: string) =>
      _registry.uiExtensions.flatMap(ext => ext.menuItems?.filter(item => {
        if (!tag) {
          tag = MENU_TAG_MAIN
        }
        if (tag === MENU_TAG_MAIN && !item.menuTag) {
          return true
        }

        return normalizeValue(item.menuTag).some(value => value === tag)
      }) || []),

    normalize: () => _registry
  }

  return _registry
}

export type UIExtensionRegistry = {
  registry: ExtensionRegistry

  uiExtensions: UIExtension[]

  getExtensions: (type: string) => UIExtension[]

  getExtension: (type: string, code?: string) => UIExtension

  getExtensionByCode: (ext: string) => UIExtension | undefined

  registerAll: (exts: UIExtension[]) => Promise<void>

  register: (ext: UIExtension) => Promise<void>

  registerSync: (ext: UIExtension) => void

  produceComponent: UIExtensionFactory

  triggerEvent: <Params extends EventParams = EventParams>(
    wallet: WalletWrapper, event: MaybeArray<string>, params?: Params
  ) => Promise<void>

  getMenuItems: (tag?: string) => ManuItemParams[]

  normalize: () => UIExtensionRegistry
}


export const ERROR_NO_UIEXTENSION = 'ERROR_NO_UIEXTENSION'