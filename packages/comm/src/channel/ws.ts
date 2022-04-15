
import { createWSClient, Receiver, WSClientConfig } from "../client"
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

    send: async (message, ok?) => {
      if (typeof ok === 'boolean') {
        message = (ok ? COMM_WS_PREFIX_CONFIRMED : COMM_WS_PREFIX_ERROR) + ':' + message
      }
      return await client.send(message)
    },

    close: async () => {
      _comm.unregister(_channel)
      await client.close()
    }
  }

  return _channel
}