import {
  buildExtensionRegistry,
  CredentialSchema,
  Extension, 
  ExtensionRegistry
} from "@owlmeans/regov-ssi-extension"
import { 
  EmptyProps, 
} from "../common"
import { ManuItemParams } from "../component"
import { 
  UIExtension, 
  UIExtensionFactory 
} from "./extension"

export const buildUIExtensionRegistry = <
  Ext extends Extension<string> = Extension<string>
>(): UIExtensionRegistry<Ext> => {
  type UIExt = InfererdUIExtension<Ext>
  type CredType = Ext extends Extension<infer CT> ? CT : never

  const _typeToExtension: { [key: string]: UIExt[] } = {}

  const _registry: UIExtensionRegistry<Ext> = {
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

    registerAll: async exts => {
      await Promise.all(exts.map(async ext => _registry.register(ext)))
    },

    register: async ext => {
      _registry.registerSync(ext)
    },

    registerSync: ext => {
      _registry.registry.registerSync(ext.extension as unknown as Ext)
      _registry.uiExtensions.push(ext)
      Object.entries(ext.extension.schema.credentials).forEach(
        ([_, cred]: [string, CredentialSchema]) => {
          _typeToExtension[cred.mainType] = [
            ...(_typeToExtension[cred.mainType] ? _typeToExtension[cred.mainType] : []),
            ext
          ]
        }
      )
    },

    produceComponent: <Type extends EmptyProps = EmptyProps>(purpose: string, type?: CredType) => {
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

    getMenuItems: () => _registry.uiExtensions.flatMap(ext => ext.menuItems || [])
  }

  return _registry
}


export type InfererdUIExtension<Ext extends Extension<string>> = UIExtension<
  Ext extends Extension<infer CredType, any> ? CredType : never,
  Ext extends Extension<any, infer FlowType> ? FlowType : never
>

export type UIExtensionRegistry<
  Ext extends Extension<string> = Extension<string>
  > = {
    registry: ExtensionRegistry<Ext>

    uiExtensions: InfererdUIExtension<Ext>[]

    getExtensions: (type: string) => InfererdUIExtension<Ext>[]

    getExtension: (type: string, code?: string) => InfererdUIExtension<Ext>

    registerAll: (exts: InfererdUIExtension<Ext>[]) => Promise<void>

    register: (ext: InfererdUIExtension<Ext>) => Promise<void>

    registerSync: (ext: InfererdUIExtension<Ext>) => void

    produceComponent: UIExtensionFactory<Ext extends Extension<infer CredType> ? CredType : never>

    getMenuItems: () => ManuItemParams[]
  }


export const ERROR_NO_UIEXTENSION = 'ERROR_NO_UIEXTENSION'