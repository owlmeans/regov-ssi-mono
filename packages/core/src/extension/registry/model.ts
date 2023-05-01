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


import { normalizeValue } from '../../common'
import { ExtensionEvent } from '../schema'
import { CredentialService, Extension } from '../ext'
import { ERROR_NO_EXTENSION, ExtensionRegistry } from './types'
import { documentWarmer } from '../../did/loader'
import { BASE_CREDENTIAL_TYPE } from '../../vc'


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

            if (cred.contextUrl) {
              documentWarmer(
                cred.contextUrl,
                JSON.stringify({ '@context': cred.credentialContext })
              )
            }

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

    getFactory: type => {
      const ext = _registry.getExtension(type)
      return Object.entries(ext.factories).filter(([_type]) => {
        return normalizeValue(type).includes(_type)
      }).map(([, factory]) => factory).find(factory => factory) as CredentialService
    },

    getExtension: (type, code?) => {
      if (Array.isArray(type)) {
        const toRemove = type.findIndex(type => type === BASE_CREDENTIAL_TYPE)
        if (toRemove > -1) {
          type = [...type]
          type.splice(toRemove, 1)
        }
        const exts = Object.entries(_typeToExtension).map(([_type, extensions]) => {
          if (type.includes(_type)) {
            const exts: [Extension, number][] = extensions.map(ext => {
              const description = ext.schema?.credentials && ext.schema.credentials[_type]
              if (description) {
                return [
                  ext,
                  normalizeValue(description.mandatoryTypes)
                    .reduce(
                      (accum, descType) => accum + (descType && type.includes(descType) ? 1 : 0)
                      , type.includes(description.mainType) ? 2 : 1
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
    },

    triggerEvent: async (wallet, event, params) => {
      const observers = _registry.getObservers(event)
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
  }

  return _registry
}