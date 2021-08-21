import { buildDidHelper, buildDidRegistryWarpper } from "metabelarusid-did";
import { buildCommonContext, Credential, UnsignedCredentail } from "../credential";
import { buildKeyChain } from "../keys";
import { buildStore } from "../store/store";
import { SecureStore } from "../store/types";
import { CredentialsRegistry, CredentialsRegistryWrapper } from "./registry";
import { WalletWrapperBuilder } from "./types";

export const buildWalletWrapper: WalletWrapperBuilder =
  async (crypto, password, store = undefined, keyOptions = undefined) => {
    const _store: SecureStore = await buildStore(crypto, password, store)

    _store.data = _store.data || {}
    const keyChain = await buildKeyChain({
      crypto,
      password,
      source: _store.data.keyChain,
      keyOptions
    })
    _store.data.keyChain = keyChain.keys

    const did = buildDidRegistryWarpper(
      buildDidHelper(crypto),
      _store.data.registry
    )
    _store.data.registry = did.registry

    const ctx = await buildCommonContext({
      keys: keyChain,
      crypto,
      did
    })

    const _registryWrappers: { [key: string]: CredentialsRegistryWrapper } = {}

    return {
      did,

      ctx,

      store: _store,

      wallet: _store.data,

      getRegistry: (type, peer = true) => {
        const key = `${peer ? 'peer' : ''}${peer ? type[0].toUpperCase() + type.slice(1) : type}`
        if (!_registryWrappers[key]) {
          let _registry: CredentialsRegistry = (<any>_store.data)[key]
          if (!_registry) {
            (<any>_store.data)[key] = _registry = {
              defaultSection: 'own',
              credentials: { own: [], peer: [] }
            }
          }
          _registryWrappers[key] = {
            registry: _registry,

            addCredential: async (credential, section?: string) => {
              const wrappedCred = {
                credential,
                meta: { secure: false }
              }
              _registry.credentials[section || _registry.defaultSection].push(wrappedCred)

              return wrappedCred
            },

            lookupCredentials: async (type, section?) => {
              section = section || 'owm'
              return _registry.credentials[section].filter((wrapper) => {
                return type.every(type => wrapper.credential.type.includes(type))
              })
            },

            removeCredential: async (credential, section?) => {
              section = section || 'owm'
              if (credential.hasOwnProperty('meta')) {
                credential = (<any>credential).credential
              }

              const wrapperIdx = _registry.credentials[section].findIndex(
                credWrapper => credWrapper.credential.id === (<Credential | UnsignedCredentail>credential).id
              )
              const wrapper = _registry.credentials[section][wrapperIdx]
              _registry.credentials[section].splice(wrapperIdx, 1)

              return wrapper
            }
          }
        }

        return _registryWrappers[key]
      },

      export: async (_password?: string) => {
        if (_password) {
          password = _password
        }

        let data = JSON.stringify(_store.data)
        const chunks: string[] = []
        while (data.length > 1024) {
          chunks.push(data.substr(0, 1024))
          data = data.substr(1024)
        }
        chunks.push(data)
        const dataChunks = await Promise.all(chunks.map(chunk => crypto.encrypt(chunk, password)))

        return {
          alias: _store.alias,
          name: _store.name,
          comment: _store.comment,
          dataChunks
        }
      }
    }
  }