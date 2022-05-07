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

import { DIDCommChannel, DIDCommHelper } from "../types"


const _servers: (DIDCommChannel & DebugServer)[] = []

export const createDebugChannel = (): DIDCommChannel => {
  const _server: DIDCommChannel & DebugServer = {
    code: 'debug-server',

    init: async (didComm: DIDCommHelper) => {
      _server._model = didComm

      _servers.push(_server)
    },

    send: async (message: string) => {
      const targets = _servers.filter(server => server !== _server)
      if (targets.length > 0) {
        targets.map(target => target.receive(message))

        return true
      }

      return false
    },

    receive: (datagram) => {
      _server._model?.receive(datagram, _server)
    },

    close: async () => {
      const idx = _servers.findIndex(server => _server === server)
      if (idx > -1) {
        _servers.splice(idx, 1)
      }
      await _server._model?.unregister(_server)
    }
  }

  return _server
}

type DebugServer = {
  _model?: DIDCommHelper
  receive: (datagram: string) => void
}