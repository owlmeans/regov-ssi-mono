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

import { buildDidHelper, buildDidRegistryWarpper } from "../did"
import { buildSSICore, Credential } from "../vc"
import { buildKeyChain } from "../keys"
import { buildStore } from "../store/store"
import { SecureStore } from "../store/types"
import {
  CredentialsRegistry, CredentialsRegistryWrapper, CredentialWrapper, CredentialWrapperMetadata, RegistryItem,
  REGISTRY_SECTION_OWN, REGISTRY_TYPE_CREDENTIALS, REGISTRY_TYPE_IDENTITIES
} from "./registry"
import { GetRegistryMethod, WalletWrapper, WalletWrapperBuilder } from "./types"
import { CredentialEventParams, EXTENSION_TRIGGER_ADD_CREDENTIAL } from "../extension"
import { MaybeArray } from "../common/types"


export const buildWalletWrapper: WalletWrapperBuilder =
  async (dependencies, password, store?, options?) => {
    const _store: SecureStore = await buildStore(dependencies.crypto, password, store)

    _store.data = _store.data || {}
    const keyChain = await buildKeyChain({
      crypto: dependencies.crypto,
      password,
      source: _store.data.keyChain,
      keyOptions: options?.key
    })
    _store.data.keyChain = keyChain.keys

    const did = buildDidRegistryWarpper(
      buildDidHelper(dependencies.crypto, {
        prefix: options?.prefix,
        schemaPath: options?.didSchemaPath,
        baseSchemaUrl: options?.defaultSchema
      }),
      _store.data.registry
    )
    _store.data.registry = did.registry

    const ctx = await buildSSICore({
      keys: keyChain,
      crypto: dependencies.crypto,
      did
    })

    const _registryWrappers: { [key: string]: CredentialsRegistryWrapper } = {}

    const _getRegistry: GetRegistryMethod = (type = REGISTRY_TYPE_CREDENTIALS) => {
      if (!_registryWrappers[type]) {
        let _registry: CredentialsRegistry = (<any>_store.data)[type]
        if (!_registry) {
          (<any>_store.data)[type] = _registry = {
            defaultSection: REGISTRY_SECTION_OWN,
            credentials: { own: [], peer: [] }
          }
        }
        _registryWrappers[type] = {
          registry: _registry,

          addCredential: async <
            Subject extends MaybeArray<{}> = {},
            Type extends RegistryItem<Subject> = Credential<Subject>,
            Meta extends CredentialWrapperMetadata = CredentialWrapperMetadata
          >(credential: Type, section?: string) => {
            const wrappedCred: CredentialWrapper<Subject, Type, Meta> = {
              credential: credential,
              meta: {
                secure: false,
              } as Meta
            }
            if (section && !_registry.credentials[section]) {
              _registry.credentials[section] = []
            }
            _registry.credentials[section || _registry.defaultSection].push(
              wrappedCred as CredentialWrapper
            )

            dependencies.extensions?.triggerEvent<CredentialEventParams>(
              _wallet, EXTENSION_TRIGGER_ADD_CREDENTIAL, { item: wrappedCred as CredentialWrapper }
            )

            return wrappedCred
          },

          lookupCredentials: async <
            Subject extends {} = {},
            Type extends RegistryItem<Subject> = Credential<Subject>
          >(type: string | string[], section?: string) => {
            const types: string[] = Array.isArray(type) ? type : [type]
            section = section || _registry.defaultSection

            if (!_registry.credentials[section]) {
              return []
            }
            return _registry.credentials[section].filter((wrapper) => {
              return types.every(type => wrapper.credential.type.includes(type))
            }) as CredentialWrapper<Subject, Type>[]
          },

          getCredential: <
            Subject extends {} = {},
            Type extends RegistryItem<Subject> = Credential<Subject>
          >(id?: string, section?: string) => {
            id = id || _registry.rootCredential
            if (!id) {
              return
            }

            section = section || _registry.defaultSection
            if (!_registry.credentials[section]) {
              return undefined
            }
            return _registry.credentials[section].find(
              credWrapper => credWrapper.credential.id === id
            ) as CredentialWrapper<Subject, Type> | undefined
          },

          removeCredential: async (credential, section?) => {
            section = section || _registry.defaultSection
            if (credential.hasOwnProperty('meta')) {
              credential = (<any>credential).credential
            }

            const wrapperIdx = _registry.credentials[section].findIndex(
              credWrapper => credWrapper.credential.id === (<RegistryItem>credential).id
            )
            const wrapper = _registry.credentials[section][wrapperIdx]
            _registry.credentials[section].splice(wrapperIdx, 1)

            dependencies.extensions?.triggerEvent<CredentialEventParams>(
              _wallet, EXTENSION_TRIGGER_ADD_CREDENTIAL, { item: wrapper as CredentialWrapper }
            )

            return wrapper
          }
        }
      }

      return _registryWrappers[type]
    }

    const _wallet: WalletWrapper = {
      crypto: dependencies.crypto,

      did,

      ssi: ctx,

      store: _store,

      keys: ctx.keys,

      wallet: _store.data,

      getRegistry: _getRegistry,

      hasIdentity: () => {
        return _getRegistry(REGISTRY_TYPE_IDENTITIES).getCredential() !== undefined
      },

      getIdentity: <
        Subject extends {} = {}, Identity extends Credential<Subject> = Credential<Subject>
      >() => {
        if (_wallet.hasIdentity()) {
          return _getRegistry(REGISTRY_TYPE_IDENTITIES)
            .getCredential() as unknown as CredentialWrapper<Subject, Identity>
        }

        return undefined
      },

      getIdentityCredential: <
        Subject extends {} = {}, Identity extends Credential<Subject> = Credential<Subject>
      >(id?: string) =>
        _getRegistry(REGISTRY_TYPE_IDENTITIES)
          .getCredential<Subject, Identity>(id, REGISTRY_SECTION_OWN)?.credential,

      getIdentityWrappers: <
        Subject extends {} = {},
        Identity extends Credential<Subject> = Credential<Subject>
      >() => _getRegistry(REGISTRY_TYPE_IDENTITIES).registry
        .credentials[REGISTRY_SECTION_OWN] as CredentialWrapper<Subject, Identity>[],

      getIdentities: <
        Subject extends {} = {},
        Identity extends Credential<Subject> = Credential<Subject>
      >() => _wallet.getIdentityWrappers().map(wrap => wrap.credential) as Identity[],

      findCredential: (id: string, section: string = REGISTRY_SECTION_OWN) => {
        return Object.entries(_registryWrappers).reduce<CredentialWrapper | undefined>((found, [, registry]) => {
          if (found) {
            return found
          }

          return registry.registry.credentials[section].find(_cred => _cred.credential.id === id)
        }, undefined)
      },

      export: async (_password?: string) => {
        if (_password) {
          password = _password
        }

        let data = JSON.stringify(_store.data)
        const chunks: string[] = []
        while (data.length > 1024) {
          chunks.push(data.substring(0, 1024))
          data = data.substring(1024)
        }
        chunks.push(data)
        const dataChunks = await Promise.all(chunks.map(
          chunk => dependencies.crypto.encrypt(chunk, password)
        ))

        return {
          alias: _store.alias,
          name: _store.name,
          comment: _store.comment,
          dataChunks
        }
      },

      getConfig: () => {
        return options || {}
      },

      getExtensions: () => dependencies.extensions
    }

    return _wallet
  }