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
  CreateKeyOptions, DPArgs, KeyChain, KEYCHAIN_ERROR_NO_KEY, KEYCHAIN_ERROR_WRONG_DP, KeyPair,
  KeyRotation
} from "../types"
import { COMMON_CRYPTO_ERROR_ISNOTFULL, CryptoHelper } from '../../common'


export const _createKeyBuilder = (crypto: CryptoHelper, password: string, keys?: KeyChain) =>
  async (alias: string, _password?: string, options: CreateKeyOptions = {}): Promise<KeyPair> => {
    const type = 'BIP32'

    const safe = options?.safe || false
    const safeCommentObj = (options?.safeComment ? { safeComment: options?.safeComment } : {})

    if (!options.seed && keys) {
      const seedKey = keys.keys[keys.defaultKey]
      // @TODO Make sure that we shouldn't use 0 rotation seed
      const seedRotation = seedKey.rotations[seedKey.currentRotation]
      if (seedKey.safe && !options.seedPassword) {
        throw new Error(KEYCHAIN_ERROR_NO_KEY)
      }
      options.seed = await crypto.decrypt(
        seedKey.seed,
        seedKey.safe && options.seedPassword ? options.seedPassword : _password || password
      )
      const seedDp = seedRotation.dp
      if (typeof seedDp[0] !== 'number') {
        throw new Error(KEYCHAIN_ERROR_WRONG_DP)
      }
      const newDp: DPArgs = [...seedDp]
      newDp[1] = typeof newDp[1] !== 'number' ? 1 : newDp[1] + 1
      options.dp = newDp
    }

    const seed = options.seed ? crypto.base58().decode(options.seed) : (await crypto.getRandomBytes(32))
    const seed58 = crypto.base58().encode(seed)
    const dp = options?.dp ? options.dp : <DPArgs>[0]
    if (dp.length < 1) {
      dp.push(0)
    }

    const commonKey = crypto.getKey(seed, crypto.makeDerivationPath.apply(null, dp))
    if (!commonKey.id || !commonKey.pk || !commonKey.pubKey) {
      throw new Error(COMMON_CRYPTO_ERROR_ISNOTFULL)
    }

    const nextDp = <DPArgs>[...dp]
    nextDp.unshift(<number>nextDp.shift() + 1)
    const nextKey = crypto.getKey(seed, crypto.makeDerivationPath.apply(null, nextDp))
    if (!nextKey.id || !nextKey.pk || !nextKey.pubKey) {
      throw new Error(COMMON_CRYPTO_ERROR_ISNOTFULL)
    }

    const rotation: KeyRotation = {
      type,
      opened: options.opened || false,
      private: options.opened
        ? commonKey.pk
        : await crypto.encrypt(commonKey.pk, _password || password),
      public: commonKey.pubKey,
      digest: commonKey.id,
      nextDigest: crypto.sign(commonKey.id, nextKey.pk),
      safe,
      dp,
      future: false,
      ...safeCommentObj
    }

    const nextRotation: KeyRotation = {
      type,
      opened: false,
      private: await crypto.encrypt(nextKey.pk, _password || password),
      public: await crypto.encrypt(nextKey.pubKey, _password || password),
      digest: nextKey.id,
      safe,
      future: true,
      dp: nextDp,
      ...safeCommentObj
    }

    const keypair = {
      type,
      dp: dp,
      currentRotation: 0,
      rotations: [rotation, nextRotation],
      alias,
      seed: await crypto.encrypt(seed58, _password || password),
      id: commonKey.id,
      safe,
      ...safeCommentObj
    }

    if (keys) {
      keys.keys[alias] = keypair
    }

    return keypair
  }