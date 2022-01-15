import { MaybeArray, normalizeValue } from "@owlmeans/regov-ssi-common"
import { WalletWrapper } from "@owlmeans/regov-ssi-core"
import {
  buildExtensionRegistry,
  CredentialDescription,
  Extension,
  ExtensionRegistry,
  EventParams
} from "@owlmeans/regov-ssi-extension"
import {
  EmptyProps,
} from "../common"
import {
  MENU_TAG_MAIN
} from "../component"
import {
  UIExtension,
  UIExtensionFactory,
} from "./extension"
import {
  ManuItemParams
} from './types'


export const buildUIExtensionRegistry = <
  CredType extends string,
  Ext extends Extension<CredType> = Extension<CredType>
>(): UIExtensionRegistry<CredType, Ext> => {
  type UIExt = UIExtension<CredType, Ext>

  const _typeToExtension: { [key: string]: UIExt[] } = {}

  const _registry: UIExtensionRegistry<CredType, Ext> = {
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
      _registry.registry.registerSync(ext.extension as unknown as Ext)
      _registry.uiExtensions.push(ext as unknown as UIExt)
      if (ext.extension.schema.credentials) {
        Object.entries(ext.extension.schema.credentials).forEach(
          ([_, cred]: [string, CredentialDescription]) => {
            _typeToExtension[cred.mainType] = [
              ...(_typeToExtension[cred.mainType] ? _typeToExtension[cred.mainType] : []),
              ext as unknown as UIExt
            ]
          }
        )
      }
    },

    produceComponent: <Type extends EmptyProps = EmptyProps>(purpose: string, type?: MaybeArray<CredType>) => {
      if (type) {
        const types = normalizeValue(type)
        type = types.find(type => {
          return !!_typeToExtension[type]
        })
      }

      const wraps = type ? _typeToExtension[type].flatMap(
        ext => ext.produceComponent<Type>(purpose, type as any)
      ) : _registry.uiExtensions.flatMap(
        ext => ext.produceComponent<Type>(purpose)
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
        async (proceed, [event, ext]) => {
          if (!proceed) {
            return false
          }
          const _params = params || { ext }
          console.log(`event::triggered:${event.trigger}:${ext.schema.details.code}`, event.code)
          if (event.filter && !await event.filter(wallet, _params)) {
            return true
          }
          console.log('event::filter passed')
          if (event.method) {
            if (!_params.ext) {
              _params.ext = ext
            }
            console.log('event::call_method')

            if (await event.method(wallet, _params)) {
              console.log('event::bubbling_stoped')
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

export type UIExtensionRegistry<
  CredType extends string,
  Ext extends Extension<CredType> = Extension<CredType>
  > = {
    registry: ExtensionRegistry<CredType, Ext>

    uiExtensions: UIExtension<CredType, Ext>[]

    getExtensions: (type: string) => UIExtension<CredType, Ext>[]

    getExtension: (type: string, code?: string) => UIExtension<CredType, Ext>

    getExtensionByCode: (ext: string) => UIExtension<CredType, Ext> | undefined

    registerAll: (exts: UIExtension<CredType, Ext>[]) => Promise<void>

    register: (ext: UIExtension<CredType, Ext>) => Promise<void>

    registerSync: <CT extends CredType, E extends Extension<CT> = Extension<CT>>(ext: UIExtension<CT, E>) => void

    produceComponent: UIExtensionFactory<Ext extends Extension<infer CredType> ? CredType : never>

    triggerEvent: <Params extends EventParams<CredType> = EventParams<CredType>>(
      wallet: WalletWrapper, event: MaybeArray<string>, params?: Params
    ) => Promise<void>

    getMenuItems: (tag?: string) => ManuItemParams[]

    normalize: () => UIExtensionRegistry<string>
  }


export const ERROR_NO_UIEXTENSION = 'ERROR_NO_UIEXTENSION'