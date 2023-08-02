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

import { CryptoAdapter } from './types'

let _adapter: CryptoAdapter

export const getCryptoAdapter = (): CryptoAdapter => {
  if (_adapter == null) {
    _adapter = {
      base58: {
        encode: (() => { }) as any,
        decode: (() => { }) as any,
        toArray: (() => { }) as any,
      },

      sha256: {
        toBytes: (() => { }) as any,
        hash: (() => { }) as any
      },

      aes: {
        encoder: undefined
      },

      secp: {
        sign: (() => { }) as any,
        verify: (() => { }) as any
      },

      WalletClass: class X { } as any,

      _wallets: {},

      random: (() => { }) as any,

      setBase58Impl: (encode, decode, toArray) => {
        _adapter.base58.encode = encode
        _adapter.base58.decode = decode
        _adapter.base58.toArray = toArray
      },

      setSha256Impl: (hash, toBytes) => {
        _adapter.sha256.toBytes = toBytes
        _adapter.sha256.hash = hash
      },

      setAesImpl: (encoder) => {
        _adapter.aes.encoder = encoder
      },

      setRandomImpl: (random) => {
        _adapter.random = random
      },

      setSecpImpl: (sign, verify) => {
        _adapter.secp.sign = sign
        _adapter.secp.verify = verify
      }
    }
  }

  return _adapter
}
