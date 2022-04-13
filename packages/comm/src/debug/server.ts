
import { DIDCommChannel, DIDCommHelper } from "../types"


const _servers: (DIDCommChannel & DebugServer)[] = []

export const createDebugServer = (): DIDCommChannel => {
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