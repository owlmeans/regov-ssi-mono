import { buildDidCommHelper, createWSChannel, DIDCommChannel, DIDCommHelper, DIDCommListner } from '@owlmeans/regov-comm'
import { addObserverToSchema, buildExtension, buildExtensionSchema, DIDDocument, isPresentation } from '@owlmeans/regov-ssi-core'
import { localizations } from './i18n'
import {
  CommExtConfig, DEFAULT_SERVER_ALIAS, SendRequestEventParams,
  EVENT_INIT_CONNECTION, EVENT_SEND_REQUEST, InitCommEventParams, REGOV_EXT_COMM_NAMESPACE, CommExtension
} from './types'


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
          params.registerDidHandle.registerDid = async (dids) => {
            return Promise.all(dids.map(async did => helper.listen(did)))
          }
        }
        await params.resolveConnection()
      } catch (err) {
        await params.rejectConnection(err)
      }
    }
  })

  commExtensionSchema = addObserverToSchema(commExtensionSchema, {
    trigger: EVENT_SEND_REQUEST,
    filter: async (wallet, params: SendRequestEventParams) => {
      const combined = wallet.store.alias + ':' + (params.alias || DEFAULT_SERVER_ALIAS)
      return !params.statusHandle.sent && !!_channels[combined]
    },
    method: async (wallet, params: SendRequestEventParams) => {
      params.statusHandle.sent = true
      try {
        const helper = _didComm[wallet.store.alias]
        const listener: DIDCommListner = {
          established: async (conn) => {
            try {
              await helper.send(params.cred, conn)
              await params.resolveSending()
            } catch (err) {
              await params.rejectSending(err)
            }
          },
          receive: async (_, cred) => {
            if (isPresentation(cred)) {
              await params.resolveResponse(cred)
            }
          }
        }
        await helper.addListener(listener)
        await helper.connect({
          recipientId: params.recipient,
          sender: params.sender || (wallet.getIdentity()?.credential)?.holder as DIDDocument
        })
      } catch (err) {
        await params.rejectSending(err)
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