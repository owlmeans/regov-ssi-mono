
import { MaybeArray, normalizeValue } from '@owlmeans/regov-ssi-common'
import { ExtensionEvent } from '../schema'
import { Extension } from '../ext'
import { ERROR_NO_EXTENSION, ExtensionRegistry } from './types'

export const buildExtensionRegistry = <
  Ext extends Extension<string, string | undefined> = Extension<string, string | undefined>
>(): ExtensionRegistry<Ext> => {

  const _typeToExtension: {
    [type: string]: Ext[]
  } = {}

  const _registry: ExtensionRegistry<Ext> = {
    extensions: [],

    register: async (ext) => {
      _registry.registerSync(ext)
    },

    registerSync: ext => {
      _registry.extensions.push(ext)
      Object.entries(ext.schema.credentials).forEach(([_, cred]) => {
        _typeToExtension[cred.mainType] = [
          ...(_typeToExtension[cred.mainType] ? _typeToExtension[cred.mainType] : []),
          ext
        ]
      })
    },

    getExtensions: (type) => {
      return _typeToExtension[type] || []
    },

    getExtension: (type, code?) => {
      if (!_typeToExtension[type]) {
        throw ERROR_NO_EXTENSION
      }
      const ext = code
        ? _typeToExtension[type].find(ext => ext.schema.details.code === code)
        : _typeToExtension[type][0]
      if (!ext) {
        throw ERROR_NO_EXTENSION
      }

      return ext
    },

    registerAll: async (exts) => {
      await Promise.all(exts.map(async ext => _registry.register(ext)))
    },

    getObservers: <FlowType extends string>(event: MaybeArray<string>) => {
      const events = normalizeValue(event)
      type ObserverExtension = Extension<string, string>
      const observers = (_registry.extensions as ObserverExtension[]).flatMap(
        (ext: ObserverExtension) => (
          ext.schema.events?.filter(
            event => normalizeValue(event.trigger).some(type => events.includes(type))
          ) || []).map(observer => [observer, ext])
      )

      return observers as [ExtensionEvent<FlowType>, Ext][]
    }
  }

  return _registry
}