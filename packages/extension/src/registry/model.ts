
import { normalizeValue } from '@owlmeans/regov-ssi-common'
import { ExtensionEvent } from '../schema'
import { Extension } from '../ext'
import { ERROR_NO_EXTENSION, ExtensionRegistry } from './types'

export const buildExtensionRegistry = <
  CredType extends string
>(): ExtensionRegistry => {

  const _typeToExtension: {
    [type: string]: Extension[]
  } = {}

  const _registry: ExtensionRegistry = {
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
      if (Array.isArray(type)) {
        const exts = Object.entries(_typeToExtension).map(([_type, extensions]) => {
          if (type.includes(_type)) {
            const exts: [Extension, number][] = extensions.map(ext => {
              const description = ext.schema?.credentials && ext.schema.credentials[_type]
              if (description) {
                return [
                  ext,
                  normalizeValue(description.mandatoryTypes)
                    .reduce(
                      (accum, descType) => accum + (descType && type.includes(descType) ? 1 : 0), 1
                    )
                ]
              }

              return [ext, 0]
            })
            return exts.sort((a, b) => b[1] - a[1]).shift()
          }
        })
        const ext = exts.filter(ext => ext).sort((a, b) => a && b ? (b[1] - a[1]) : 0)
          .map(bundle => bundle && bundle[0]).shift()

        if (!ext) {
          throw ERROR_NO_EXTENSION
        }

        return ext
      }

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

      return observers as [ExtensionEvent, Extension][]
    }
  }

  return _registry
}