import { CryptoHelper } from "@owlmeans/regov-ssi-common";
import { DEFAULT_WALLET_ALIAS } from "../wallet/types";
import { BasicStore, EncryptedStore, SecureStore } from "./types";

export const buildStore = async (crypto: CryptoHelper, password: string, store?: BasicStore | string): Promise<SecureStore> => {
  let _store: SecureStore
  switch (typeof store) {
    default:
    case 'undefined':
      store = DEFAULT_WALLET_ALIAS
    case 'string':
      _store = {
        alias: store,
        name: store,
        data: {}
      }
      break
    case 'object':
      if ((<EncryptedStore>store).dataChunks) {
        const chunks: string[] = (<EncryptedStore>store).dataChunks || []
        _store = {
          alias: store.alias,
          name: store.name,
          comment: store.comment,
          data: JSON.parse(
            (
              await Promise.all(
                chunks.map((chunk) => crypto.decrypt(chunk, password))
              )
            ).join('')
          )
        }
      } else if ((<SecureStore>store).data) {
        _store = <SecureStore>store
      } else {
        _store = { 
          alias: store.alias,
          name: store.name,
          comment: store.comment, 
          data: {} 
        }
      }
      break
  }

  if (!_store.data) {
    _store.data = {}
  }

  return _store
}