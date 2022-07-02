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

import { createWSClient, WSClientConfig } from "../client"
import { COMM_WS_PREFIX_CONFIRMED, COMM_WS_PREFIX_ERROR, COMM_WS_SUBPROTOCOL, DIDCommChannel, DIDCommHelper } from "../types"


export const createWSChannel = async (config: WSClientConfig): Promise<DIDCommChannel> => {
  let _comm: DIDCommHelper

  const client = await createWSClient(config, (msg) => {
    console.log('Received: ' + msg.substring(0, 32))
    if (_comm && _channel) {
      _comm.receive(msg, _channel)
    }
  })

  const _channel: DIDCommChannel = {
    code: config.subProtocal || COMM_WS_SUBPROTOCOL,

    init: async (didComm: DIDCommHelper) => {
      _comm = didComm
    },

    send: async (message, params) => {
      if (typeof params?.ok === 'boolean') {
        message = (params.ok ? COMM_WS_PREFIX_CONFIRMED : COMM_WS_PREFIX_ERROR) + ':' + message
      }
      return await client.send(message, params?.id)
    },

    close: async () => {
      _comm.unregister(_channel)
      await client.close()
    }
  }

  return _channel
}