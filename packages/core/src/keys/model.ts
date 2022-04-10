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
  BuildKeyChainWrapperMethod, KeyChain, KEYCHAIN_DEFAULT_KEY, KeyRotation, KeyPair,
  KEYCHAIN_ERROR_NO_KEY, KeyPairToCryptoKeyOptions, KEYCHAIN_ERROR_CANT_ROTATION,
} from "./types"
import { CryptoKey } from '../common'
import { _createKeyBuilder } from "./builder"


export const buildKeyChain: BuildKeyChainWrapperMethod =
  async ({ password, source, keyOptions, crypto }) => {

    const _openKey = async (
      keypair: KeyPair,
      _password?: string,
      rotation?: number
    ): Promise<KeyRotation> => {
      rotation = rotation !== undefined ? rotation : keypair.currentRotation
      const keyRotation = keypair.rotations[rotation]
      if (keyRotation.opened) {
        return keyRotation
      }

      return {
        ...keyRotation,
        opened: true,
        private: await crypto.decrypt(keyRotation.private, _password || password)
      }
    }

    const _ensureKeyPair = async (
      keys: KeyChain, key: KeyPair | string | undefined, _password?: string, options?: KeyPairToCryptoKeyOptions
    ): Promise<[KeyRotation, KeyPair]> => {
      if (!key) {
        key = keys.defaultKey
      }
      if (typeof key === 'string') {
        key = keys.keys[key]
      }
      if (!key) {
        throw new Error(KEYCHAIN_ERROR_NO_KEY)
      }

      let keyRotation = key.rotations[
        options?.rotation !== undefined ? options?.rotation : key.currentRotation
      ]

      if (!keyRotation.opened) {
        return [await _openKey(
          key,
          _password || password,
          options?.rotation
        ), key]
      }

      throw new Error(KEYCHAIN_ERROR_CANT_ROTATION)
    }

    const _keyPairToCryptoKey = (keys: KeyChain) =>
      async (
        key?: KeyPair | string, _password?: string, options?: KeyPairToCryptoKeyOptions
      ): Promise<CryptoKey> => {
        const [keyRotation, _key] = await _ensureKeyPair(keys, key, _password, options)

        return {
          id: options?.id || _key.id,
          pk: keyRotation.private,
          pubKey: keyRotation.public,
          nextKeyDigest: keyRotation.nextDigest ? crypto.hash(keyRotation.nextDigest) : undefined
        }
      }


    const keys = source || {
      defaultKey: KEYCHAIN_DEFAULT_KEY,
      keys: {
        [KEYCHAIN_DEFAULT_KEY]: await _createKeyBuilder(crypto, password)(KEYCHAIN_DEFAULT_KEY, password, keyOptions)
      }
    }

    return {
      keys,

      getDefaultPassword: () => password,

      openKey: _openKey,

      getCryptoKey: _keyPairToCryptoKey(keys),

      createKey: _createKeyBuilder(crypto, password, keys),

      expandKey: async (key, _password = undefined) => {
        if (!key.pk) {
          Object.entries(keys.keys).find(([, _key]) => {
            return _key.rotations.find(_rotation => {
              const found = _rotation.public === key.pubKey
              if (found) {
                key.id = _key.id
                key.pk = _rotation.private
                key.nextKeyDigest = _rotation.nextDigest ? crypto.hash(_rotation.nextDigest) : undefined
              }

              return found
            })
          })
          if (key.pk) {
            key.pk = await crypto.decrypt(key.pk, _password || password)
          }
        }
      }
    }
  }


