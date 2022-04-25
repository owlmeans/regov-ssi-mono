import {
  buildExtensionRegistry, CredentialDescription, EventParams, ExtensionRegistry, MaybeArray, WalletWrapper
} from "@owlmeans/regov-ssi-core"
import { ServerExtension } from "./types"


export const buildServerExtensionRegistry = (): ServerExtensionRegistry => {
  const _typeToExtension: { [key: string]: ServerExtension[] } = {}

  const _registry: ServerExtensionRegistry = {
    registry: buildExtensionRegistry(),

    serverExtensions: [],

    register: async (ext) => {
      _registry.registerSync(ext)
    },

    registerSync: (ext) => {
      _registry.registry.registerSync(ext.extension)
      _registry.serverExtensions.push(ext)
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

    triggerEvent: async (wallet, event, params) => {
      const observers = _registry.registry.getObservers(event)
      await observers.reduce(
        async (proceed: Promise<boolean>, [event, ext]) => {
          if (!await proceed) {
            return false
          }
          const _params = { ...params, ext }
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
    }
  }

  return _registry
}

export type ServerExtensionRegistry = {
  registry: ExtensionRegistry

  serverExtensions: ServerExtension[]

  register: (ext: ServerExtension) => Promise<void>

  registerSync: (ext: ServerExtension) => void

  triggerEvent: <Params extends EventParams = EventParams>(
    wallet: WalletWrapper, event: MaybeArray<string>, params?: Params
  ) => Promise<void>
}