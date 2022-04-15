
import { client as WSClient, connection as WSConnection } from 'websocket'
import {
  COMM_WS_PREFIX_CONFIRMED, COMM_WS_PREFIX_ERROR, COMM_WS_SUBPROTOCOL, ERROR_COMM_WS_TIMEOUT
} from '../types'
import { CommWSClient, Receiver, WSClientConfig } from './types'


export const createWSClient = (config: WSClientConfig, receive?: Receiver) => {
  return new Promise<CommWSClient>((resolve, reject) => {
    let _conn: WSConnection
    const _wsClient = new WSClient()

    _wsClient.connect(config.server, config.subProtocal || COMM_WS_SUBPROTOCOL)

    const _client: CommWSClient = {
      occupied: false,

      opened: false,

      send: async (msg: string) => {
        if (_client.opened) {
          if (_client.occupied) {
            console.error('Tried to use occuppied connection!')
            return new Promise((resolve, reject) => {
              setTimeout(async () => {
                try {
                  if (await _client.send(msg)) {
                    resolve(true)
                  }
                  resolve(false)
                } catch (e) {
                  reject(e)
                }
              }, 250 * Math.random())
            })
          }

          _client.occupied = true
          let timeout: ReturnType<typeof setTimeout> | undefined
          try {
            await new Promise((resolve, reject) => {
              _conn.send(msg, err => err ? reject(err) : resolve(undefined))
            })
            console.log('sending... ' + msg.substring(0, 23))
            if (!msg.startsWith(COMM_WS_PREFIX_CONFIRMED + ':')
              && !msg.startsWith(COMM_WS_PREFIX_ERROR + ':')) {
              const code = await new Promise<string>((resolve, reject) => {
                _client.currentResolve = resolve
                _client.currentReject = reject
                timeout = setTimeout(() => reject(ERROR_COMM_WS_TIMEOUT), config.timeout * 1000)
              })
              console.log('Sent', msg.substring(0, 16) + '...', code)
            }
          } catch (err) {
            console.log(err)
            if (_conn.connected) {
              _conn.drop()
            }
            return false
          } finally {
            if (timeout) {
              clearTimeout(timeout)
            }
            _client.occupied = false
            delete _client.currentReject
            delete _client.currentResolve
          }

          return true
        }

        return false
      },

      close: async () => {
        if (_client.opened) {
          await new Promise((resolve) => {
            _conn.close(WSConnection.CLOSE_REASON_NORMAL)
            _conn.on('close', () => resolve(undefined))
          })
        }
      }
    }

    _wsClient.on('connect', connection => {
      _conn = connection
      _client.opened = true

      _conn.on('close', () => _client.opened = false)

      _conn.on('message', msg => {
        if (msg.type === 'utf8') {
          const data = msg.utf8Data
          if (_client.occupied && data.startsWith(COMM_WS_PREFIX_CONFIRMED + ':')) {
            const code = data.substring(data.search(':') + 1)
            _client.currentResolve && _client.currentResolve(code)
          } else if (_client.occupied && data.startsWith(COMM_WS_PREFIX_ERROR + ':')) {
            const code = data.substring(data.search(':') + 1)
            _client.currentReject && _client.currentReject(code)
          } else {
            if (receive) {
              receive(data)
            } else {
              console.log(data)
            }
          }
        }
      })

      resolve(_client)
    })

    _wsClient.on('connectFailed', err => reject(err))
  })
}