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

import { CryptoHelper } from "../common"
import { DEFAULT_WALLET_ALIAS } from "../wallet/types"
import { BasicStore, EncryptedStore, ERROR_STORE_CANT_DECRYPT, SecureStore } from "./types"


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
        try {
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
        } catch (e) {
          console.error(e)
          
          throw new Error(ERROR_STORE_CANT_DECRYPT)
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