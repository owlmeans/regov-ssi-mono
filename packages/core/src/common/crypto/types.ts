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

import type { encodeBase58, decodeBase58, toBeArray, getBytes } from 'ethers/lib.esm/utils'
import type { sha256, randomBytes } from 'ethers/lib.esm/crypto'
import type { HDNodeWallet } from 'ethers/lib.esm/wallet'
import type { signSync, verify } from '@noble/secp256k1'

export type CryptoHelper = {
  buildSignSuite: (keyOptions: BuildSignSignatureOptions) => Object

  hash: (data: Buffer | string) => string

  hashBytes: (data: Buffer) => string

  sign: (data: string, key: string) => string

  getRandomBytes: (size: number) => Uint8Array

  verify: (signature: string, data: string, key: string) => boolean

  normalizePassword: (password: string) => Uint8Array

  encrypt: (body: string, password: string) => Promise<string>

  decrypt: (chiper: string, password: string) => Promise<string>

  makeDerivationPath: (index?: number, change?: number, account?: number, bc?: string) => string

  base58: () => Base58Lib

  makeId: (key: string, payload?: string, expand?: boolean) => string

  /**
   * @bug seed param implicitly requires Buffer not Uint8Array!
   */
  getKey: (seed: Uint8Array, derivationPath?: string) => CryptoKey & { dp: string }
}

export interface CryptoAdapter {
  base58: {
    encode: typeof encodeBase58
    decode: typeof decodeBase58
    toArray: typeof toBeArray
  }

  sha256: {
    toBytes: typeof getBytes
    hash: typeof sha256
  }

  aes: {
    encoder: any
  }

  secp: {
    sign: typeof signSync,
    verify: typeof verify
  },

  random: typeof randomBytes

  WalletClass: typeof HDNodeWallet

  _wallets: {
    [key: string]: HDNodeWallet
  }

  setBase58Impl: (encode: typeof encodeBase58, decode: typeof decodeBase58, toArray: typeof toBeArray) => void
  setSha256Impl: (hash: typeof sha256, toBytes: typeof getBytes) => void
  setAesImpl: (encoder: any) => void
  setRandomImpl: (random: typeof randomBytes) => void
  setSecpImpl: (sign: typeof signSync, _verify: typeof verify) => void
}

export type Base58Lib = {
  encode: (a: Uint8Array) => string
  decode: (a: string) => Uint8Array
}

export type BuildSignSignatureOptions = {
  publicKey: string
  privateKey: string
  id: string
  controller: string
}

export type CryptoKey = {
  id?: string
  pk?: string
  pubKey?: string
  nextKeyDigest?: string,
  fragment?: string
}

export const COMMON_CRYPTO_ERROR_NOPK = 'COMMON_CRYPTO_ERROR_NOPK'
export const COMMON_CRYPTO_ERROR_NOPUBKEY = 'COMMON_CRYPTO_ERROR_NOPUBKEY'
export const COMMON_CRYPTO_ERROR_NOID = 'COMMON_CRYPTO_ERROR_NOID'
export const COMMON_CRYPTO_ERROR_ISNOTFULL = 'COMMON_CRYPTO_ERROR_ISNOTFULL'
export const COMMON_CRYPTO_ERROR_NOKEY = 'COMMON_CRYPTO_ERROR_NOKEY'