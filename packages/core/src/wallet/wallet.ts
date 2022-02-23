import { buildDidHelper, buildDidRegistryWarpper } from "@owlmeans/regov-ssi-did";
import { buildSSICore, Credential, CredentialSubject } from "../vc";
import { buildKeyChain } from "../keys";
import { buildStore } from "../store/store";
import { SecureStore } from "../store/types";
import {
  CredentialsRegistry,
  CredentialsRegistryWrapper,
  CredentialWrapper,
  RegistryItem,
  REGISTRY_SECTION_OWN,
  REGISTRY_TYPE_CREDENTIALS,
  REGISTRY_TYPE_IDENTITIES
} from "./registry";
import { GetRegistryMethod, WalletWrapperBuilder } from "./types";


export const buildWalletWrapper: WalletWrapperBuilder =
  async (crypto, password, store?, options?) => {
    const _store: SecureStore = await buildStore(crypto, password, store)

    _store.data = _store.data || {}
    const keyChain = await buildKeyChain({
      crypto,
      password,
      source: _store.data.keyChain,
      keyOptions: options?.key
    })
    _store.data.keyChain = keyChain.keys

    const did = buildDidRegistryWarpper(
      buildDidHelper(crypto, { 
        prefix: options?.prefix, 
        schemaPath: options?.didSchemaPath,
        baseSchemaUrl: options?.defaultSchema
      }),
      _store.data.registry
    )
    _store.data.registry = did.registry

    const ctx = await buildSSICore({
      keys: keyChain,
      crypto,
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

          addCredential: async (credential, section?: string) => {
            const wrappedCred = {
              credential,
              meta: {
                secure: false,
              }
            }
            if (section && !_registry.credentials[section]) {
              _registry.credentials[section] = []
            }
            _registry.credentials[section || _registry.defaultSection].push(
              wrappedCred as CredentialWrapper<CredentialSubject>
            )

            return wrappedCred
          },

          lookupCredentials: async <
            Subject extends CredentialSubject = CredentialSubject,
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
            Subject extends CredentialSubject = CredentialSubject,
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

            return wrapper
          }
        }
      }

      return _registryWrappers[type]
    }

    const _wallet = {
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
        Subject extends CredentialSubject = CredentialSubject,
        Identity extends Credential<Subject> = Credential<Subject>
      >() => {
        if (_wallet.hasIdentity()) {
          return _getRegistry(REGISTRY_TYPE_IDENTITIES)
            .getCredential() as unknown as CredentialWrapper<Subject, Identity>
        }

        return undefined
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
        const dataChunks = await Promise.all(chunks.map(chunk => crypto.encrypt(chunk, password)))

        return {
          alias: _store.alias,
          name: _store.name,
          comment: _store.comment,
          dataChunks
        }
      },

      getConfig: () => {
        return options || {}
      }
    }

    return _wallet
  }