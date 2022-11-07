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

import { 
  buildWalletLoader, Credential, REGISTRY_SECTION_PEER, REGISTRY_TYPE_IDENTITIES, WalletWrapper 
} from "@owlmeans/regov-ssi-core"
import { ERROR_NO_PEER_VCS, ServerAppConfig } from "./types"
import fs from 'fs'
import { reviveJson } from "../utils"


export const readPeerVCs = async (wallet: WalletWrapper, config: ServerAppConfig) => {
  await new Promise(async (resolve, reject) => {
    if (!config.peerVCs) {
      reject(ERROR_NO_PEER_VCS)
      return
    }
    fs.readdir(config.peerVCs, async (err, files) => {
      if (err) {
        reject(err)
        return
      }

      console.log('Found potenatial creds to read', files)

      await Promise.all(files.map(async file => {
        return new Promise((resolve, reject) => {
          if (!file.match(/\.json$/)) {
            console.log(`Skip file: ${file}`)
            resolve(undefined)
            return
          }

          fs.readFile(config.peerVCs + '/' + file, async (err, data) => {
            if (err) {
              reject(err)
              return
            }

            try {
              console.log(`Read file: ${file}`)
              const vc: Credential = JSON.parse(data.toString('utf8'), reviveJson)
              const [result, err] = await wallet.ssi.verifyCredential(vc, undefined, {
                localLoader: buildWalletLoader(wallet),
                verifyEvidence: true,
                verifySchema: true,
                nonStrictEvidence: true
              })
              if (!result) {
                throw err
              }
              const registry = wallet.getRegistry(REGISTRY_TYPE_IDENTITIES)
              if (registry.getCredential(vc.id, REGISTRY_SECTION_PEER)) {
                throw ERROR_VC_EXISTS
              }
              console.log(`Adding cred from: ${file}`)
              await registry.addCredential(vc, REGISTRY_SECTION_PEER)
            } catch (e) {
              console.error(e)
            } finally {
              resolve(undefined)
            }
          })
        })
      }))

      resolve(undefined)
    })
  })
}

const ERROR_VC_EXISTS = 'ERROR_VC_EXISTS'