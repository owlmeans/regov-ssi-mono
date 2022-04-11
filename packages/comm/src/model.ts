import { DIDDocument, didPurposeList, DIDPURPOSE_AUTHENTICATION, DIDVerificationItem, DIDVerificationMethod, KEYCHAIN_ERROR_NO_KEY, normalizeValue, VERIFICATION_KEY_HOLDER, WalletWrapper } from "@owlmeans/regov-ssi-core"
import {
  COMM_CHANNEL_BROADCAST,
  COMM_CHANNEL_DEFAULT,
  DIDCommChannel, DIDCommConnectMeta, DIDCommHelper, ERROR_COMM_NODID, ERROR_COMM_NO_RECIPIENT, ERROR_COMM_NO_SENDER, ERROR_COMM_SEND_FAILED
} from "./types"
import { didDocToCommKeyBuilder } from "./util"
import { x25519Encrypter, createJWE, JWE, createJWT, ES256KSigner, decodeJWT, verifyJWT } from 'did-jwt'


export const buildDidCommHelper = (wallet: WalletWrapper): DIDCommHelper => {

  const _channels: DIDCommChannel[] = []

  let _defaultChannel: DIDCommChannel

  const _helper: DIDCommHelper = {
    pack: async (doc, connection) => {
      if (!connection.recipient) {
        throw new Error(ERROR_COMM_NODID)
      }

      const commKey = await didDocToCommKeyBuilder(wallet.did.helper())(connection.recipient)
      if (!commKey.id || !commKey.pubKey) {
        throw new Error(KEYCHAIN_ERROR_NO_KEY)
      }
      const encrypter = x25519Encrypter(commKey.pubKey, commKey.id)

      return createJWE(Buffer.from(JSON.stringify(doc), 'utf8'), [encrypter])
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

      const signer = ES256KSigner(wallet.crypto.base58().decode(cryptoKey.pk))

      const jwt = await createJWT(connection, { issuer: connection.sender.id, signer })

      const channels: DIDCommChannel[] = []
      if (connection.channel) {
        if (connection.channel === COMM_CHANNEL_BROADCAST) {
          _channels.forEach(_channel => channels.push(_channel))
        } else if (connection.channel === COMM_CHANNEL_DEFAULT) {
          _channels.push(_defaultChannel)
        } else {
          const channel = _channels.find(channel => channel.code === connection.channel)
          if (channel) {
            _channels.push(channel)
          }
        }
      } else {
        channels.push(_defaultChannel)
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
    },

    receive: async (datagram) => {
      if (datagram.startsWith('{') && datagram.endsWith('}')) {
        try {
          const jwe: JWE = JSON.parse(datagram)
          /**
           * @TODO Call unpack method
           */
        } catch (_) {
        }
      }

      const jwt = decodeJWT(datagram)
      const result = await verifyJWT(datagram, {
        resolver: {
          resolve: async () => {
            const did: DIDDocument = JSON.parse(JSON.stringify(jwt.payload.sender))
            didPurposeList.forEach(
              purpose => {
                if (did[purpose]) {
                  did[purpose] = normalizeValue(did[purpose]) as DIDVerificationItem[]
                }
              }
            )
            if (did.proof) {
              delete (did as any).proof
            }

            return {
              didResolutionMetadata: {},
              didDocumentMetadata: {},
              didDocument: did as any
            }
          }
        },
        proofPurpose: DIDPURPOSE_AUTHENTICATION
      })

      /**
       * @PROCEED
       * 
       * 1. Verify sender diddoc
       * 2. Verify sender agreement key
       * 3. Call listeners accept method
       */
      console.log(result)
    }
  }

  return _helper
}