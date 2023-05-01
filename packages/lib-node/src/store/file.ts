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

import { EncryptedStore, WalletHandler } from "@owlmeans/regov-ssi-core"
import { ServerStore } from "./types"
import fs from 'fs'
import { default as Path } from 'path'
import { reviveJson } from "../utils"


export const buildFileStore = (path: string): ServerStore => {
  let _handler: WalletHandler

  const _store: ServerStore = {
    init: async (handler: WalletHandler) => {
      _handler = handler
      await new Promise((resolve, reject) => fs.readdir(path, async (err, files) => {
        if (err) {
          return reject(err)
        }
        handler.stores = await files.reduce(
          async (_stores, file) => await new Promise(resolve => {
            if (!file.match(/\.json$/)) {
              resolve(_stores)
              return
            }

            fs.readFile(path + '/' + file, async (err, data) => {
              const stores = await _stores
              if (err) {
                return stores
              }
              try {
                const store: EncryptedStore = JSON.parse(data.toString('utf8'), reviveJson)
                stores[store.alias] = store
              } catch (e) {
                return stores
              }

              resolve(stores)
            })
          }), Promise.resolve<{ [key: string]: EncryptedStore }>({})
        )

        handler.observers.push(() => _store.commit().catch(console.error))

        resolve(undefined)
      }))
    },

    commit: async () => {
      if (!_handler) {
        return
      }
      if (!_handler.wallet) {
        return
      }

      try {
        await new Promise(async (resolve, reject) => {
          if (!_handler.wallet) {
            return reject()
          }
          fs.writeFile(
            path + Path.sep + _handler.wallet.store.alias + '.json',
            JSON.stringify(await _handler.wallet.export()),
            err => err ? reject(err) : resolve(undefined)
          )
        })
      } catch (e) {
        console.error(e)
      }
    }
  }

  return _store
}