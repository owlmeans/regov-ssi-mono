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

import {
  buildWalletLoader, Credential, DIDDocument, DIDPURPOSE_AUTHENTICATION, DIDPURPOSE_VERIFICATION, ERROR_NO_CREDENTIAL_SIGNING_KEY, ERROR_NO_IDENTITY,
  isPresentation, KEYCHAIN_ERROR_NO_KEY, Presentation, REGISTRY_SECTION_OWN, REGISTRY_TYPE_IDENTITIES, UnsignedCredential,
  VERIFICATION_KEY_CONTROLLER,
  VERIFICATION_KEY_HOLDER, WalletWrapper
} from "@owlmeans/regov-ssi-core"
import {
  COMM_CHANNEL_BROADCAST, COMM_CHANNEL_DEFAULT, DIDCommChannel, DIDCommConnectMeta, DIDCommHelper,
  DIDCommListner, ERROR_COMM_ALIAN_SENDER, ERROR_COMM_DID_WRONG_SIGNATURE,
  ERROR_COMM_INVALID_PAYLOAD, ERROR_COMM_MALFORMED_PAYLOAD, ERROR_COMM_NODID, ERROR_COMM_NO_CHANNEL,
  ERROR_COMM_NO_CONNECTION, ERROR_COMM_NO_RECIPIENT, ERROR_COMM_NO_SENDER
} from "./types"
import { didDocToCommKeyBuilder, filterConnectionFields, invertConnection, parseJWE } from "./util"
import {
  x25519Encrypter, createJWE, createJWT, ES256KSigner, decodeJWT, verifyJWT, x25519Decrypter,
  decryptJWE
} from 'did-jwt'
import { buildBasicResolver } from "./resolver/basic"
import { commDidHelperBuilder } from "./did"


export const buildDidCommHelper = (wallet: WalletWrapper): DIDCommHelper => {

  const _channels: DIDCommChannel[] = []

  const _didDocs: { [key: string]: DIDDocument } = {}

  const _recipientWaiters: { [key: string]: ((doc: DIDDocument) => Promise<void>)[] } = {}

  let _defaultChannel: DIDCommChannel | undefined

  const _listeners: DIDCommListner[] = []

  const _didsToListen: string[] = []

  const _didHelper = commDidHelperBuilder(wallet)

  const _getSigner = async (connection: DIDCommConnectMeta) => {
    const item = wallet.did.helper().expandVerificationMethod(connection.sender, DIDPURPOSE_AUTHENTICATION, VERIFICATION_KEY_HOLDER)
    const cryptoKey = await wallet.did.extractKey(connection.sender, VERIFICATION_KEY_HOLDER)
    if (item.id !== cryptoKey?.id) {
      throw 'No authentication key'
    }
    if (!cryptoKey) {
      throw new Error(KEYCHAIN_ERROR_NO_KEY)
    }
    await wallet.keys.expandKey(cryptoKey)
    if (!cryptoKey.pk) {
      throw new Error(KEYCHAIN_ERROR_NO_KEY)
    }

    return ES256KSigner(wallet.crypto.base58().decode(cryptoKey.pk))
  }

  const _helper: DIDCommHelper =
  {
    pack: async (doc, connection) => {
      if (!connection.recipient) {
        throw new Error(ERROR_COMM_NODID)
      }

      const commKey = await didDocToCommKeyBuilder(wallet.did.helper())(connection.recipient)
      if (!commKey.id || !commKey.pubKey) {
        throw new Error(KEYCHAIN_ERROR_NO_KEY)
      }
      const encrypter = x25519Encrypter(commKey.pubKey, connection.recipientId)

      return createJWE(
        Buffer.from(JSON.stringify(doc), 'utf8'),
        [encrypter],
        connection
      )
    },

    cleanup: async () => {
      _defaultChannel = undefined
      _listeners.splice(0)
      _didsToListen.splice(0)
      await Promise.all(_channels.map(channel => channel.close()))
      _channels.splice(0)
    },

    connect: async (options, recipient?, did?) => {
      recipient = recipient || options?.recipientId
      did = did || options?.sender

      if (!recipient) {
        throw new Error(ERROR_COMM_NO_RECIPIENT)
      }

      if (!did) {
        throw new Error(ERROR_COMM_NO_SENDER)
      }

      const connection: DIDCommConnectMeta = {
        ...options, recipientId: recipient, sender: did
      }

      const signer = await _getSigner(connection)

      const jwt = await createJWT(connection, { issuer: connection.sender.id, signer })

      const channels: DIDCommChannel[] = []
      if (connection.channel) {
        if (connection.channel === COMM_CHANNEL_BROADCAST) {
          _channels.forEach(_channel => channels.push(_channel))
        } else if (connection.channel === COMM_CHANNEL_DEFAULT) {
          _defaultChannel && _channels.push(_defaultChannel)
        } else {
          const channel = _channels.find(channel => channel.code === connection.channel)
          if (channel) {
            _channels.push(channel)
          }
        }
      } else {
        _defaultChannel && channels.push(_defaultChannel)
      }

      if (connection.allowAsync) {
        if (_didDocs[connection.recipientId]) {
          connection.recipient = _didDocs[connection.recipientId]
          connection.channel = channels[0].code
          _listeners.forEach(listener => listener.established && listener.established(connection))

          return connection
        }
        if (!_recipientWaiters[connection.recipientId]) {
          _recipientWaiters[connection.recipientId] = []
        }
        const receive = async (doc: DIDDocument) => {
          connection.recipient = _didDocs[doc.id] = doc
          connection.channel = channels[0].code
          _listeners.forEach(listener => listener.established && listener.established(connection))
          const idx = _recipientWaiters[connection.recipientId].findIndex(receiver => receiver === receive)
          if (idx > -1) {
            _recipientWaiters[connection.recipientId].splice(idx, 1)
          }
        }
        _recipientWaiters[connection.recipientId].push(receive)
      }

      channels.forEach(channel => channel.send(jwt))

      return connection
    },

    unregister: async (channel: DIDCommChannel) => {
      const idx = _channels.findIndex(_channel => _channel === channel)
      if (idx > -1) {
        _channels.splice(idx, 1)
        if (_channels.length > 0 && channel === _defaultChannel) {
          _defaultChannel = _channels[0]
        }
      }
    },

    addChannel: async (channel: DIDCommChannel, def: boolean = false) => {
      await channel.init(_helper)
      _channels.push(channel)
      if (def || !_defaultChannel) {
        _defaultChannel = channel
      }
      await Promise.allSettled(_didsToListen.map(async did => channel.send(did)))
    },

    addListener: async (listner) => {
      listner.init && await listner.init(_helper)
      _listeners.push(listner)
    },

    removeListener: (listener: DIDCommListner) => {
      const idx = _listeners.findIndex(_listener => _listener === listener)
      idx > -1 && _listeners.splice(idx, 1)
    },

    accept: async (connection) => {
      const channel = _channels.find(channel => channel.code === connection.channel)
      if (!channel) {
        throw new Error(ERROR_COMM_NO_CHANNEL)
      }

      const signer = await _getSigner(connection)

      const jwt = await createJWT(connection, { issuer: connection.sender.id, signer })
      console.log('Accept to: ' + connection.recipientId)
      await channel.send(jwt)

      return connection
    },

    send: async (doc, connection) => {
      if (!connection.sender) {
        throw new Error(ERROR_COMM_NO_SENDER)
      }
      if (!connection.recipient) {
        throw new Error(ERROR_COMM_NO_RECIPIENT)
      }

      const jwe = await _helper.pack(doc, connection)

      const channel = _channels.find(channel => channel.code === connection.channel)
      if (channel) {
        return await channel.send(JSON.stringify(jwe))
      }

      return false
    },

    receive: async (_datagram, channel) => {
      const [id, ...splitedData] = _datagram.split(':')
      const datagram = splitedData.join(':')
      if (datagram.startsWith('ok:') || datagram.startsWith('error:')) {
        return
      }
      if ('did' === id) {
        try {
          const doc = wallet.did.helper().parseLongForm(_datagram)
          if (wallet.did.helper().isDIDDocument(doc)) {
            _didDocs[doc.id] = doc
            if (_recipientWaiters[doc.id]) {
              _recipientWaiters[doc.id].forEach(receive => receive(doc))
            }
          }
        } catch (e) {
          console.error('check long format message - failed')
        }

        return
      }
      if (datagram.startsWith('{') && datagram.endsWith('}')) {
        try {
          const jwe = parseJWE(datagram)
          if (!jwe?.protected) {
            throw new Error(ERROR_COMM_NO_CONNECTION)
          }
          const connection: DIDCommConnectMeta = JSON.parse(Buffer.from(jwe.protected, 'base64').toString())
          if (!connection) {
            throw new Error(ERROR_COMM_NO_CONNECTION)
          }
          const recipientId = connection.recipientId
          if (!recipientId) {
            throw new Error(ERROR_COMM_NO_RECIPIENT)
          }
          if (!wallet.did.helper().verifyDID(connection.sender)) {
            throw new Error(ERROR_COMM_NO_SENDER)
          }
          const credential = wallet.findCredential(recipientId)?.credential
          if (!credential) {
            throw new Error(ERROR_COMM_NODID)
          }
          const holder = wallet.did.helper().isDIDDocument(credential.holder)
            ? credential.holder : credential.issuer as unknown as DIDDocument
          if (!holder) {
            throw new Error(ERROR_COMM_NODID)
          }
          const commKey = await _didHelper.extractCommKey(holder)
          const decrypter = await x25519Decrypter(commKey.pk)
          const decodedJWE8a = await decryptJWE(jwe, decrypter)
          const decodedJWE: Credential | Presentation = JSON.parse(Buffer.from(decodedJWE8a).toString('utf8'))

          if (isPresentation(decodedJWE)) {
            const [verified, result] = await wallet.ssi.verifyPresentation(
              decodedJWE, undefined,
              { localLoader: buildWalletLoader(wallet), nonStrictEvidence: true, testEvidence: false }
            )
            if (!verified) {
              console.error(result)
              throw new Error(ERROR_COMM_INVALID_PAYLOAD)
            }
          } else {
            const [verified, result] = await wallet.ssi.verifyCredential(decodedJWE, undefined, {
              verifyEvidence: false, verifySchema: false, nonStrictEvidence: true
            })
            if (!verified) {
              console.error(result)
              throw new Error(ERROR_COMM_INVALID_PAYLOAD)
            }
          }

          if (!wallet.did.helper().isDIDDocument(decodedJWE.holder)) {
            throw new Error(ERROR_COMM_MALFORMED_PAYLOAD)
          }

          const docVerification = wallet.did.helper().expandVerificationMethod(
            decodedJWE.holder, DIDPURPOSE_AUTHENTICATION, VERIFICATION_KEY_HOLDER
          )

          const senderVerification = wallet.did.helper().expandVerificationMethod(
            connection.sender, DIDPURPOSE_VERIFICATION, VERIFICATION_KEY_HOLDER
          )

          if (docVerification.publicKeyBase58 !== senderVerification.publicKeyBase58) {
            try {
              const docVerificationC = wallet.did.helper().expandVerificationMethod(
                decodedJWE.holder, DIDPURPOSE_VERIFICATION, VERIFICATION_KEY_CONTROLLER
              )
              if (docVerificationC.publicKeyBase58 !== senderVerification.publicKeyBase58) {
                throw new Error(ERROR_COMM_ALIAN_SENDER)
              }
            } catch (e) {
              throw new Error(ERROR_COMM_ALIAN_SENDER)
            }
          }

          await channel.send(connection.recipientId, { ok: true, id })

          _listeners.forEach(listener => listener.receive && listener.receive(
            invertConnection(connection, channel.code), decodedJWE
          ))
        } catch (error) {
          console.error('JWE Error', error)
          await channel.send(ERROR_COMM_MALFORMED_PAYLOAD, { ok: false, id })
          throw error
        } finally {
          return
        }
      }

      try {
        const jwt = decodeJWT(datagram)
        if (jwt.payload.request?.credentialSubject.handshakeSequence) {
          const identity = wallet.getIdentity()
          if (!identity) {
            throw new Error(ERROR_NO_IDENTITY)
          }
          const cryptoKey = await wallet.did.extractKey(identity.credential.issuer as DIDDocument, VERIFICATION_KEY_HOLDER)
          if (!cryptoKey) {
            throw new Error(ERROR_NO_CREDENTIAL_SIGNING_KEY)
          }
          await wallet.keys.expandKey(cryptoKey)
          if (!cryptoKey.pk) {
            throw new Error(ERROR_NO_CREDENTIAL_SIGNING_KEY)
          }

          const unsinged = jwt.payload.request as UnsignedCredential

          unsinged.evidence = identity.credential

          const signed = await wallet.ssi.signCredential(
            unsinged,
            identity.credential.issuer as DIDDocument,
            { keyId: VERIFICATION_KEY_HOLDER }
          )
          const response = await createJWT(
            { response: signed },
            { issuer: identity.credential.id, signer: ES256KSigner(wallet.crypto.base58().decode(cryptoKey.pk)) }
          )

          await channel.send(response)
        } else {
          const result = await verifyJWT(datagram, {
            resolver: buildBasicResolver(jwt),
            proofPurpose: DIDPURPOSE_AUTHENTICATION
          })
          const connection = filterConnectionFields(result.payload as DIDCommConnectMeta)

          if (connection.sender && connection.recipient) {
            console.log('establish connection .....')
            if (!wallet.did.helper().verifyDID(connection.sender)) {
              throw new Error(ERROR_COMM_DID_WRONG_SIGNATURE)
            }
            if (!wallet.did.helper().verifyDID(connection.recipient)) {
              throw new Error(ERROR_COMM_DID_WRONG_SIGNATURE)
            }
            await channel.send(connection.recipientId, { ok: true, id })

            _listeners.forEach(
              listener =>
                listener.established && listener.established(invertConnection(connection, channel.code))
            )
          } else {
            if (!wallet.did.helper().verifyDID(connection.sender)) {
              throw new Error(ERROR_COMM_DID_WRONG_SIGNATURE)
            }

            const recipient = wallet.findCredential(connection.recipientId)

            const newConnection: DIDCommConnectMeta = {
              ...filterConnectionFields(connection),
              recipientId: connection.sender.id,
              recipient: connection.sender,
              sender: (wallet.did.helper().isDIDDocument(recipient?.credential.holder as DIDDocument)
                ? recipient?.credential.holder : recipient?.credential.issuer as unknown) as DIDDocument,
              channel: channel.code
            }

            await channel.send(newConnection.sender.id, { ok: true, id })

            _listeners.forEach(listener => listener.accept && listener.accept(newConnection))
          }
        }
      } catch (error) {
        console.error('JWT Error', error)
        await channel.send(ERROR_COMM_MALFORMED_PAYLOAD, { ok: false, id })
        throw error
      }
    },

    listen: async (did) => {
      if (typeof did === 'string') {
        const cred = wallet.findCredential(did, REGISTRY_SECTION_OWN)
        let doc: DIDDocument | undefined

        if (cred) {
          if (wallet.did.helper().isDIDDocument(cred.credential.holder)) {
            if (!cred.credential.holder.keyAgreement) {
              if (wallet.did.helper().isDIDDocument(cred.credential.issuer)) {
                if (cred.credential.issuer.keyAgreement) {
                  doc = cred.credential.issuer
                }
              }
            } else {
              doc = cred.credential.holder
            }
          }
        }

        if (cred && !doc && wallet.did.helper().isDIDDocument(cred.credential.issuer)) {
          if (cred.credential.issuer.keyAgreement) {
            doc = cred.credential.issuer
          }
        }

        if (!doc) {
          return false
        }

        const long = await wallet.did.helper().didToLongForm(doc)
        _didsToListen.push(long)
        return (await Promise.allSettled(_channels.map(
          async channel => channel.send(long)
        ))).some(result => typeof result === 'boolean' && result)
      }
      return (await Promise.allSettled(did.getRegistry(REGISTRY_TYPE_IDENTITIES)
        .registry.credentials[REGISTRY_SECTION_OWN].map(cred => _helper.listen(cred.credential.id))
      )).some(result => typeof result === 'boolean' && result)
    }
  }

  return _helper
}