
import { MaybeArray, normalizeValue } from '@owlmeans/regov-ssi-common'
import { ExtensionEvent } from '../schema'
import { Extension } from '../ext'
import { ERROR_NO_EXTENSION, ExtensionRegistry } from './types'

export const buildExtensionRegistry = <
  CredType extends string,
  Ext extends Extension<CredType> = Extension<CredType>
>(): ExtensionRegistry<CredType, Ext> => {

  const _typeToExtension: {
    [type: string]: Ext[]
  } = {}

  const _registry: ExtensionRegistry<CredType, Ext> = {
    extensions: [],

    register: async (ext) => {
      _registry.registerSync(ext)
    },

    registerSync: ext => {
      _registry.extensions.push(ext)
      if (ext.schema.credentials) {
        Object.entries<typeof ext.schema.credentials[CredType]>(ext.schema.credentials)
          .forEach(([_, cred]) => {
            _typeToExtension[cred.mainType] = [
              ...(_typeToExtension[cred.mainType] ? _typeToExtension[cred.mainType] : []), ext
            ]
            normalizeValue(cred.mandatoryTypes).forEach(type => {
              if (!type) {
                return
              }
              _typeToExtension[type] = [
                ...(_typeToExtension[type] ? _typeToExtension[type] : []), ext
              ]
            })
          })
      }
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

    getObservers: (event) => {
      const events = normalizeValue(event)
      const observers = (_registry.extensions).flatMap(
        ext => (
          ext.schema.events?.filter(
            event => normalizeValue(event.trigger).some(type => events.includes(type))
          ) || []).map(observer => [observer, ext])
      )

      return observers as [ExtensionEvent<CredType>, Ext][]
    }
  }

  return _registry
}