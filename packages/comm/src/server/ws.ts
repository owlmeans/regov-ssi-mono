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

import { server as WSServer, connection as WSConnection } from 'websocket'
import { Server as HttpServer } from 'http'
import { ServerConfig } from './types'
import {
  COMM_WS_PREFIX_CONFIRMED, COMM_WS_PREFIX_ERROR, COMM_WS_SUBPROTOCOL, DIDCommConnectMeta,
  ERROR_COMM_INVALID_PAYLOAD, ERROR_COMM_MALFORMED_PAYLOAD, ERROR_COMM_NO_CONNECTION,
  ERROR_COMM_NO_RECIPIENT, ERROR_COMM_NO_SENDER, ERROR_COMM_WS_DID_REGISTERED, ERROR_COMM_WS_TIMEOUT
} from '../types'
import { buildWalletWrapper, ExtensionRegistry, makeRandomUuid, nodeCryptoHelper } from '@owlmeans/regov-ssi-core'
import { parseJWE } from '../util'
import { decodeJWT } from 'did-jwt'


const messages: { [key: string]: SentMessage } = {}

export const startWSServer = async (
  server: HttpServer, config: ServerConfig, extensions?: ExtensionRegistry
): Promise<void> => {
  const _wsServer = new WSServer({ httpServer: server })

  const serverWallet = await buildWalletWrapper(
    { crypto: nodeCryptoHelper, extensions }, '00000000', { alias: 'server', name: 'Regov' },
    {
      prefix: config.did.prefix,
      defaultSchema: config.did.baseSchemaUrl,
      didSchemaPath: config.did.schemaPath
    }
  )
  const didHelper = serverWallet.did.helper()

  const _clientList: { [uuid: string]: Client } = {}
  const _didToClient: { [did: string]: string } = {}
  const _messages: { [did: string]: Message[] } = {}

  setInterval(() => {
    Object.entries(_messages).forEach(([did, messages]) => {
      if (messages.length > 0) {
        let idx = messages.length - 1
        for (; idx > -1; --idx) {
          if (messages[idx].ttl < Date.now()) {
            break
          }
        }
        if (idx > -1) {
          messages.splice(0, idx + 1)
        }
      }
      if (messages.length < 1) {
        delete _messages[did]
      }
    })
  }, config.message.ttl)

  /**
   * @@TODO Process paused connections 
   */
  // const _pokeUuid = async (uuid: string) => {
  //   const client = _clientList[uuid]
  //   if (client) {
  //      await Promise.allSettled(client.dids.map(async did => _pokeDid(did)))
  //   }
  // }

  const _pokeDid = async (did: string) => {
    console.log('>>> Poke did: ' + did)
    if (!_didToClient[did]) {
      return
    }
    const uuid = _didToClient[did]
    const client = _clientList[uuid]
    if (!client) {
      return
    }
    // if (client.occupied) {
    //   console.log('> Tryied to use occupied connection for: ' + did)
    //   setTimeout(() => _pokeDid(did), 1000 * Math.random())
    //   return
    // }
    if (_messages[did] && _messages[did].length) {
      const msg = _messages[did].shift()
      if (!msg) {
        return
      }
      console.log('try to send: ' + msg.id)
      let timeout: ReturnType<typeof setTimeout> | undefined
      const [id] = msg.data.split(':', 1)
      try {
        await new Promise((resolve, reject) => {
          client.connection.send(msg.data, err => err ? reject(err) : resolve(undefined))
        })
        messages[id] = { id }
        const defer = new Promise<string>((resolve, reject) => {
          messages[id].resolve = resolve
          messages[id].reject = reject
          timeout = setTimeout(() => reject(ERROR_COMM_WS_TIMEOUT), config.timeout * 1000)
        })
        const code = await defer
        console.log('Sent to ' + uuid + ': ' + code)
      } catch (err) {
        console.error(`Crash from ${uuid}: ${err}`)
        if (!_messages[did]) {
          _messages[did] = []
        }
        _messages[did].unshift(msg)
        if (client.connection.connected) {
          client.connection.drop()
        }
      } finally {
        if (timeout) {
          clearTimeout(timeout)
        }
        console.log('> Released occupied')
        delete messages[id]
      }
      if (_messages[did]) {
        if (_messages[did].length) {
          setImmediate(() => _pokeDid(did))
        } else {
          delete _messages[did]
        }
      }
    }
  }

  const _addMessage = (did: string, message: string) => {
    if (!_messages[did]) {
      _messages[did] = []
    }

    _messages[did].push({
      id: nodeCryptoHelper.hash(message),
      data: message,
      ttl: Date.now() + config.message.ttl
    })
    setImmediate(() => _pokeDid(did))
  }

  _wsServer.on('request', request => {
    request.accept(config.subProtocol || COMM_WS_SUBPROTOCOL, request.origin)
  })

  _wsServer.on('connect', conn => {
    const uuid = makeRandomUuid()
    console.log('Connected ' + uuid)
    const client: Client = {
      connection: conn,
      dids: []
    }
    _clientList[uuid] = client

    const _send = async (msg: string) => {
      try {
        console.log('...seding: ' + msg.substring(0, 32))
        await new Promise((resolve, reject) => {
          client.connection.send(msg, err => err ? reject(err) : resolve(undefined))
        })
      } catch (err) {
        console.log(`Crash from ${uuid}: ${err}`)
        if (client.connection.connected) {
          client.connection.drop()
        }
      } finally {
        console.log('released occupied')
      }
    }

    conn.on('message', async msg => {
      if (msg.type === 'utf8') {
        const [id, ...splitedData] = msg.utf8Data.split(':')
        const data = splitedData.join(':')
        console.log('[data]: ' + data.substring(0, 32))
        if (messages[id] && data.startsWith(COMM_WS_PREFIX_CONFIRMED + ':')) {
          const code = data.substring(data.search(':') + 1)
          const resolve = messages[id].resolve
          return resolve && resolve(code)
        } else if (messages[id] && data.startsWith(COMM_WS_PREFIX_ERROR + ':')) {
          const code = data.substring(data.search(':') + 1)
          const reject = messages[id].reject
          return reject && reject(code)
        } else if (data.startsWith('did:')) {
          const didInfo = didHelper.parseDIDId(data)
          const did = didInfo.did
          if (_didToClient[did]) {
            return await _send(id + ':' + COMM_WS_PREFIX_ERROR + ':' + ERROR_COMM_WS_DID_REGISTERED)
          }

          _didToClient[did] = uuid
          client.dids.push(did)
          _pokeDid(did)

          return await _send(id + ':' + COMM_WS_PREFIX_CONFIRMED + ':' + data)
        } else if (data.startsWith('{') && data.endsWith('}')) {
          const jwe = parseJWE(data)
          if (!jwe?.protected) {
            return await _send(id + ':' + COMM_WS_PREFIX_ERROR + ':' + ERROR_COMM_NO_CONNECTION)
          }
          const commConn: DIDCommConnectMeta = JSON.parse(Buffer.from(jwe.protected, 'base64').toString())
          if (!commConn) {
            return await _send(id + ':' + COMM_WS_PREFIX_ERROR + ':' + ERROR_COMM_NO_CONNECTION)
          }
          if (!await didHelper.verifyDID(commConn.sender)) {
            return await _send(id + ':' + COMM_WS_PREFIX_ERROR + ':' + ERROR_COMM_NO_SENDER)
          }
          if (commConn.recipient && await !didHelper.verifyDID(commConn.recipient)) {
            return await _send(id + ':' + COMM_WS_PREFIX_ERROR + ':' + ERROR_COMM_NO_RECIPIENT)
          }
          _addMessage(commConn.recipientId, id + ':' + data)
          return await _send(id + ':' + COMM_WS_PREFIX_CONFIRMED + ':' + commConn.recipientId)
        }
        try {
          const jwt = decodeJWT(data)
          console.log('we got jwt: ' + jwt.payload.iss)
          const commConn: DIDCommConnectMeta = jwt.payload as DIDCommConnectMeta
          const results = [
            !commConn.recipientId,
            !commConn.sender || !didHelper.verifyDID(commConn.sender),
            commConn.recipient && !didHelper.verifyDID(commConn.recipient)
          ]
          if (results.some(result => result)) {
            console.error('ERROR JWT', results)
            return await _send(id + ':' + COMM_WS_PREFIX_ERROR + ':' + ERROR_COMM_MALFORMED_PAYLOAD)
          }
          console.log('JWT from: ' + commConn.sender.id + ' - to: ' + commConn.recipientId)
          _addMessage(commConn.recipientId, id + ':' + data)
          return await _send(id + ':' + COMM_WS_PREFIX_CONFIRMED + ':' + commConn.recipientId)
        } catch (err) {
          return await _send(id + ':' + COMM_WS_PREFIX_ERROR + ':' + ERROR_COMM_INVALID_PAYLOAD)
        }
      }
    })

    conn.on('close', () => {
      console.log('Disconnect ' + uuid + ' - removed did listening for: ' + client.dids.length)
      client.dids.map(did => delete _didToClient[did])
      delete _clientList[uuid]
    })
  })
}

type Client = {
  connection: WSConnection
  dids: string[]
}

type Message = {
  id: string
  data: string
  ttl: number
}

type SentMessage = {
  id: string
  resolve?: (value: string) => void
  reject?: (reason?: any) => void
}