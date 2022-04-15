
import { server as WSServer, connection as WSConnection } from 'websocket'
import { Server as HttpServer } from 'http'
import { ServerConfig } from './types'
import {
  COMM_WS_PREFIX_CONFIRMED, COMM_WS_PREFIX_ERROR, COMM_WS_SUBPROTOCOL, DIDCommConnectMeta, ERROR_COMM_INVALID_PAYLOAD,
  ERROR_COMM_MALFORMED_PAYLOAD, ERROR_COMM_NO_CONNECTION, ERROR_COMM_NO_RECIPIENT, ERROR_COMM_NO_SENDER,
  ERROR_COMM_WS_DID_REGISTERED,
  ERROR_COMM_WS_TIMEOUT
} from '../types'
import { buildDidHelper, makeRandomUuid, nodeCryptoHelper } from '@owlmeans/regov-ssi-core'
import { parseJWE } from '../util'
import { decodeJWT } from 'did-jwt'


export const startWSServer = (server: HttpServer, config: ServerConfig): void => {
  const _wsServer = new WSServer({ httpServer: server })

  const didHelper = buildDidHelper(nodeCryptoHelper, config.did)

  const _clientList: { [uuid: string]: Client } = {}
  const _didToClient: { [did: string]: string } = {}
  const _messages: { [did: string]: string[] } = {}

  /**
   * @PROCEED Process paused connections 
   */
  // const _pokeUuid = async (uuid: string) => {
  //   const client = _clientList[uuid]
  //   if (client) {
  //      await Promise.allSettled(client.dids.map(async did => _pokeDid(did)))
  //   }
  // }

  const _pokeDid = async (did: string) => {
    if (!_didToClient[did]) {
      return
    }
    const uuid = _didToClient[did]
    const client = _clientList[uuid]
    if (!client) {
      return
    }
    if (client.occupied) {
      setTimeout(() => _pokeDid(did), 250 * Math.random())
      return
    }
    if (_messages[did] && _messages[did].length) {
      const msg = _messages[did].shift()
      if (!msg) {
        return
      }
      let timeout: ReturnType<typeof setTimeout> | undefined
      try {
        client.occupied = true
        await new Promise((resolve, reject) => {
          client.connection.send(msg, err => err ? reject(err) : resolve(undefined))
        })
        const code = await new Promise<string>((resolve, reject) => {
          client.proceedCurrent = resolve
          client.stopCurrent = reject
          timeout = setTimeout(() => reject(ERROR_COMM_WS_TIMEOUT), config.timeout * 1000)
        })
        console.log('Sent to ' + uuid + ': ' + code)
      } catch (err) {
        console.log(`Crash from ${uuid}: ${err}`)
        _messages[did].unshift(msg)
        if (client.connection.connected) {
          client.connection.drop()
        }
      } finally {
        if (timeout) {
          clearTimeout(timeout) 
        }
        client.occupied = false
        client.proceedCurrent && delete client.proceedCurrent
        client.stopCurrent && delete client.stopCurrent
      }
      if (_messages[did].length) {
        setImmediate(() => _pokeDid(did))
      }
    }
  }

  const _addMessage = (did: string, message: string) => {
    if (!_messages[did]) {
      _messages[did] = []
    }

    _messages[did].push(message)
    setImmediate(() => _pokeDid(did))
  }

  _wsServer.on('request', request => {
    request.accept(config.subProtocol || COMM_WS_SUBPROTOCOL, request.origin)
  })

  _wsServer.on('connect', conn => {
    const uuid = makeRandomUuid()
    console.log('Connected ' + uuid)
    const client: Client = {
      occupied: false,
      connection: conn,
      dids: []
    }
    _clientList[uuid] = client

    const _send = async (msg: string) => {
      if (client.occupied) {
        console.error('Tried to use occuppied connection!')
        setTimeout(() => _send(msg), 250 * Math.random())
        return
      }
      try {
        client.occupied = true
        await new Promise((resolve, reject) => {
          client.connection.send(msg, err => err ? reject(err) : resolve(undefined))
        })
      } catch (err) {
        console.log(`Crash from ${uuid}: ${err}`)
        if (client.connection.connected) {
          client.connection.drop()
        }
      } finally {
        client.occupied = false
        // client.proceedCurrent && delete client.proceedCurrent
        // client.stopCurrent && delete client.stopCurrent
      }
    }


    conn.on('message', async msg => {
      if (msg.type === 'utf8') {
        const data = msg.utf8Data
        if (client.occupied && data.startsWith(COMM_WS_PREFIX_CONFIRMED + ':')) {
          const code = data.substring(data.search(':') + 1)
          return client.proceedCurrent && client.proceedCurrent(code)
        } else if (client.occupied && data.startsWith(COMM_WS_PREFIX_ERROR + ':')) {
          const code = data.substring(data.search(':') + 1)
          return client.stopCurrent && client.stopCurrent(code)
        } else if (data.startsWith('did:' + config.did.prefix + ':')) {
          const didInfo = didHelper.parseDIDId(data)
          const did = didInfo.did
          if (_didToClient[did]) {
            return await _send(COMM_WS_PREFIX_ERROR + ':' + ERROR_COMM_WS_DID_REGISTERED)
          }

          _didToClient[did] = uuid
          client.dids.push(did)
          _pokeDid(did)

          return await _send(COMM_WS_PREFIX_CONFIRMED + ':' + data)
        } else if (data.startsWith('{') && data.endsWith('}')) {
          const jwe = parseJWE(data)
          if (!jwe?.protected) {
            return await _send(COMM_WS_PREFIX_ERROR + ':' + ERROR_COMM_NO_CONNECTION)
          }
          const commConn: DIDCommConnectMeta = JSON.parse(Buffer.from(jwe.protected, 'base64').toString())
          if (!commConn) {
            return await _send(COMM_WS_PREFIX_ERROR + ':' + ERROR_COMM_NO_CONNECTION)
          }
          if (!await didHelper.verifyDID(commConn.sender)) {
            return await _send(COMM_WS_PREFIX_ERROR + ':' + ERROR_COMM_NO_SENDER)
          }
          if (commConn.recipient && await didHelper.verifyDID(commConn.recipient)) {
            return await _send(COMM_WS_PREFIX_ERROR + ':' + ERROR_COMM_NO_RECIPIENT)
          }
          _addMessage(commConn.recipientId, data)
          return await _send(COMM_WS_PREFIX_CONFIRMED + ':' + commConn.recipientId)
        }
        try {
          const jwt = decodeJWT(data)
          const commConn: DIDCommConnectMeta = jwt.payload as DIDCommConnectMeta
          const results = [
            !commConn.recipientId,
            !commConn.sender || !didHelper.verifyDID(commConn.sender),
            commConn.recipient && !didHelper.verifyDID(commConn.recipient)
          ]
          if (results.some(result => result)) {
            return await _send(COMM_WS_PREFIX_ERROR + ':' + ERROR_COMM_MALFORMED_PAYLOAD)
          }
          _addMessage(commConn.recipientId, data)
          return await _send(COMM_WS_PREFIX_CONFIRMED + ':' + commConn.recipientId)
        } catch (err) {
          return await _send(COMM_WS_PREFIX_ERROR + ':' + ERROR_COMM_INVALID_PAYLOAD)
        }
      }
    })

    conn.on('close', () => {
      console.log('Disconnect ' + uuid + ' - removed did listening for: ' + client.dids.length)
      client.occupied = true
      client.dids.map(did => delete _didToClient[did])
      delete _clientList[uuid]
    })
  })
}

type Client = {
  occupied: boolean
  proceedCurrent?: (v: any) => void
  stopCurrent?: (err: any) => void
  connection: WSConnection
  dids: string[]
}