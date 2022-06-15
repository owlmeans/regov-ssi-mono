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

import {
  buildDidCommHelper, commDidHelperBuilder, createWSChannel, DIDCommChannel, DIDCommHelper,
  ERROR_COMM_CONNECTION_UNKNOWN, EVENT_INIT_CONNECTION, InitCommEventParams
} from '@owlmeans/regov-comm'
import {
  addObserverToSchema, buildExtension, buildExtensionSchema, EXTENSION_TRIGGER_ADD_CREDENTIAL,
  CredentialEventParams, EVENT_EXTENSION_AFTER_BULIDING_DID, REGISTRY_TYPE_IDENTITIES,
  REGISTRY_SECTION_OWN, ExtensionEventAfterBuildingDid
} from '@owlmeans/regov-ssi-core'
import { localizations } from './i18n'
import { CommExtConfig, DEFAULT_SERVER_ALIAS, REGOV_EXT_COMM_NAMESPACE, CommExtension, BASIC_IDENTITY_TYPE } from './types'


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
          }
          _didComm[wallet.store.alias] = helper
          const combined = wallet.store.alias + ':' + alias
          if (!_channels[combined]) {
            _channels[combined] = {
              code: '',
              init: async (_) => {},
              send: async (_, __) => false,
              close: async () => {}
            }
            _channels[combined] = await createWSChannel(cfg)
            await helper.addChannel(_channels[combined])
          }
          params.statusHandle.established = true
          params.statusHandle.helper = helper
          await params.resolveConnection(helper)
          console.info('COMM CONNECTED')
          /**
           * @TODO Process logout
           */
        } else {
          await params.rejectConnection(ERROR_COMM_CONNECTION_UNKNOWN)
        }
      } catch (err) {
        await params.rejectConnection(err)
      }
    }
  })

  commExtensionSchema = addObserverToSchema(commExtensionSchema, {
    trigger: EVENT_EXTENSION_AFTER_BULIDING_DID,
    filter: async (_, { unsigned, cred }: ExtensionEventAfterBuildingDid) => {
      return !unsigned.keyAgreement && cred.type.includes(BASIC_IDENTITY_TYPE)
    },
    method: async (wallet, { unsigned }: ExtensionEventAfterBuildingDid) => {
      const didHelper = commDidHelperBuilder(wallet)
      const extendedClone = await didHelper.addDIDAgreement(unsigned)
      unsigned.keyAgreement = extendedClone.keyAgreement
    }
  })

  /**
   * @TODO 
   * 1. Add agreement to identity and group membership DIDs
   */
  commExtensionSchema = addObserverToSchema(commExtensionSchema, {
    trigger: EXTENSION_TRIGGER_ADD_CREDENTIAL,
    filter: async (wallet, { item }: CredentialEventParams) => {
      return !!wallet.getRegistry(REGISTRY_TYPE_IDENTITIES)
        .getCredential(item.credential.id, REGISTRY_SECTION_OWN)
    },
    method: async (wallet, { item }: CredentialEventParams) => {
      if (_didComm[wallet.store.alias]) {
        _didComm[wallet.store.alias].listen(item.credential.id)
      } else {
        console.error('no comm to register id')
      }
    }
  })

  const commExtension: CommExtension = buildExtension(commExtensionSchema)
  commExtension.didComm = _didComm

  commExtension.localization = {
    ns: REGOV_EXT_COMM_NAMESPACE,
    translations: localizations
  }

  return commExtension
}