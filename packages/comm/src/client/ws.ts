/**
 *  Copyright 2023 OwlMeans
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

import { makeRandomUuid } from '@owlmeans/regov-ssi-core'
import { client as WSClient, connection as WSConnection, w3cwebsocket as BrowserClient } from 'websocket'
import {
  COMM_WS_PREFIX_CONFIRMED, COMM_WS_PREFIX_DIDDOC, COMM_WS_PREFIX_ERROR, COMM_WS_SUBPROTOCOL, ERROR_COMM_WS_TIMEOUT
} from '../types'
import { CommWSClient, Receiver, WSClientConfig } from './types'


const messages: { [key: string]: Message } = {}

const _processMessage = (_data: string, receive?: Receiver) => {
  const [id, ...splitedData] = _data.split(':')
  const data = splitedData.join(':')
  if (messages[id] && data.startsWith(COMM_WS_PREFIX_DIDDOC + ':')) {
    const code = data.substring(data.search(':') + 1)
    if (receive) {
      receive(code)
    } 
  } else if (messages[id] && data.startsWith(COMM_WS_PREFIX_CONFIRMED + ':')) {
    const code = data.substring(data.search(':') + 1)
    const resolve = messages[id].resolve
    resolve && resolve(code)
  } else if (messages[id] && data.startsWith(COMM_WS_PREFIX_ERROR + ':')) {
    const code = data.substring(data.search(':') + 1)
    const reject = messages[id].reject
    reject && reject(code)
  } else {
    if (receive) {
      receive(_data)
    } else {
      console.log('Received data: ', data)
    }
  }
}

const isWSClient = (client: BrowserClient | WSClient): client is WSClient => {
  return client.hasOwnProperty('config')
}

export const createWSClient = (config: WSClientConfig, receive?: Receiver) => {
  return new Promise<CommWSClient>((resolve, reject) => {

    const _wsClient = WSClient
      ? new WSClient() : new BrowserClient(config.server, config.subProtocal || COMM_WS_SUBPROTOCOL)

    if (isWSClient(_wsClient)) {
      let _conn: WSConnection

      _wsClient.connect(config.server, config.subProtocal || COMM_WS_SUBPROTOCOL)

      const _client: CommWSClient = {
        opened: false,

        send: async (msg, id?: string) => {
          if (!id) {
            id = makeRandomUuid()
          }
          if (_client.opened) {
            let timeout: ReturnType<typeof setTimeout> | undefined
            try {
              await new Promise((resolve, reject) => {
                _conn.send(`${id}:${msg}`, err => err ? reject(err) : resolve(undefined))
              })
              console.log('sending... ' + msg.substring(0, 23))
              if (!msg.startsWith(COMM_WS_PREFIX_CONFIRMED + ':')
                && !msg.startsWith(COMM_WS_PREFIX_ERROR + ':')) {

                messages[id] = { id }
                const defer = new Promise<string>((resolve, reject) => {
                  if (id) {
                    messages[id].resolve = resolve
                    messages[id].reject = reject
                  }

                  timeout = setTimeout(() => reject(ERROR_COMM_WS_TIMEOUT), config.timeout * 1000)
                })

                const code = await defer

                console.log('Sent', msg.substring(0, 16) + '...', code)
              }
            } catch (err) {
              console.error(err)
              if (_conn.connected) {
                _conn.drop()
              }
              return false
            } finally {
              if (timeout) {
                clearTimeout(timeout)
              }
              delete messages[id]
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
            _processMessage(msg.utf8Data, receive)
          }
        })

        resolve(_client)
      })

      _wsClient.on('connectFailed', err => reject(err))

      return _client
    } else {

      _wsClient.onopen = () => {
        _client.opened = true
        resolve(_client)
      }

      _wsClient.onerror = err => {
        if (!_client.opened) {
          reject(err)
        }
        console.error('Socket error %s', err)
      }

      _wsClient.onmessage = msg => {
        if (typeof msg.data === 'string') {
          _processMessage(msg.data, receive)
        } else {
          console.log('non string data received from ws: ', msg)
        }
      }

      _wsClient.onclose = () => _client.opened = false

      const _client: CommWSClient = {
        opened: false,

        send: async (msg, id?: string) => {
          if (!id) {
            id = makeRandomUuid()
          }
          if (_client.opened) {
            let timeout: ReturnType<typeof setTimeout> | undefined
            try {
              _wsClient.send(`${id}:${msg}`)
              console.log(`brwsr:sending {${id}}... ` + msg.substring(0, 23))
              if (!msg.startsWith(COMM_WS_PREFIX_CONFIRMED + ':')
                && !msg.startsWith(COMM_WS_PREFIX_ERROR + ':')) {
                messages[id] = { id }
                const defer = new Promise<string>((resolve, reject) => {
                  if (id) {
                    messages[id].resolve = resolve
                    messages[id].reject = reject
                  }

                  timeout = setTimeout(() => reject(ERROR_COMM_WS_TIMEOUT), config.timeout * 1000)
                })

                const code = await defer
                console.log('Sent', msg.substring(0, 16) + '...', code)
              }
            } catch (err) {
              console.error(err)
              if (_wsClient.readyState === _wsClient.OPEN) {
                _wsClient.close()
              }
              return false
            } finally {
              if (timeout) {
                clearTimeout(timeout)
              }
              delete messages[id]
            }

            return true
          }

          return false
        },

        close: async () => {
          _wsClient.close()
        }
      }

      return _client
    }
  })
}

type Message = {
  id: string
  resolve?: (value: string) => void
  reject?: (reason?: any) => void
}