import {
  buildDidCommHelper, createWSChannel, DIDCommChannel, DIDCommHelper,
  ERROR_COMM_CONNECTION_UNKNOWN, EVENT_INIT_CONNECTION, InitCommEventParams
} from '@owlmeans/regov-comm'
import {
  addObserverToSchema, buildExtension, buildExtensionSchema
} from '@owlmeans/regov-ssi-core'
import { localizations } from './i18n'
import { CommExtConfig, DEFAULT_SERVER_ALIAS, REGOV_EXT_COMM_NAMESPACE, CommExtension } from './types'


export const buildCommExtension = (config: CommExtConfig) => {

  let commExtensionSchema = buildExtensionSchema({
    name: 'extension.details.name',
    code: 'owlmeans-regov-comm'
  }, {})

  const _didComm: { [walletAlias: string]: DIDCommHelper } = {}

  const _channels: { [alias: string]: DIDCommChannel } = {}

  commExtensionSchema = addObserverToSchema(commExtensionSchema, {
    trigger: EVENT_INIT_CONNECTION,
    filter: async (_, params: InitCommEventParams) => {
      const alias = params.alias || DEFAULT_SERVER_ALIAS
      return !params.statusHandle.established || !config.wsConfig[alias]
    },
    method: async (wallet, params: InitCommEventParams) => {
      try {
        const alias = params.alias || DEFAULT_SERVER_ALIAS
        const cfg = config.wsConfig[alias]
        if (cfg) {
          const helper = _didComm[wallet.store.alias] || buildDidCommHelper(wallet)
          if (!_didComm[wallet.store.alias]) {
            helper.listen(wallet)
            /** @TODO Listen to newly added identities */
          }
          _didComm[wallet.store.alias] = helper
          const combined = wallet.store.alias + ':' + alias
          if (!_channels[combined]) {
            _channels[combined] = await createWSChannel(cfg)
            await helper.addChannel(_channels[combined])
          }
          params.statusHandle.established = true
          params.statusHandle.helper = helper
          await params.resolveConnection(helper)
        } else {
          await params.rejectConnection(ERROR_COMM_CONNECTION_UNKNOWN)
        }
      } catch (err) {
        await params.rejectConnection(err)
      }
    }
  })

  let commExtension: CommExtension = buildExtension(commExtensionSchema)
  commExtension.didComm = _didComm

  commExtension.localization = {
    ns: REGOV_EXT_COMM_NAMESPACE,
    translations: localizations
  }

  return commExtension
}