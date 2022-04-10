import { KEYCHAIN_ERROR_NO_KEY, WalletWrapper } from "@owlmeans/regov-ssi-core"
import { DIDCommHelper, ERROR_COMM_NODID } from "./types"
import { didDocToCommKeyBuilder } from "./util"
import { x25519Encrypter, createJWE } from 'did-jwt'


export const buildDidCommHelper = (wallet: WalletWrapper): DIDCommHelper => {
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
    }
  }

  return _helper
}