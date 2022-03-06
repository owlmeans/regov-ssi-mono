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
      if (!_typeToExtension[type]) {
        throw ERROR_NO_UIEXTENSION
      }
      const ext = code
        ? _typeToExtension[type].find(ext => ext.extension.schema.details.code === code)
        : _typeToExtension[type][0]
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
      const observers = _registry.registry.getObservers(event)
      await observers.reduce(
        async (proceed: Promise<boolean>, [event, ext]) => {
          if (!await proceed) {
            return false
          }
          const _params = params || { ext }
          console.info(`event::triggered:${event.trigger}:${ext.schema.details.code}`, event.code)
          if (event.filter && !await event.filter(wallet, _params)) {
            return true
          }
          console.info('event::filter passed')
          if (event.method) {
            if (!_params.ext) {
              _params.ext = ext
            }
            console.info('event::call_method')

            if (await event.method(wallet, _params)) {
              console.info('event::bubbling_stoped')
              return false
            }
          }

          return true
        }, Promise.resolve(true)
      )
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