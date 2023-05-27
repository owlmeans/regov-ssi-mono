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

import { Secp256k1Key, Secp256k1Signature } from "@owlmeans/tiny-lds-ecdsa-secp256k1-2019"
import { Base58Lib, CryptoHelper, CryptoKey } from "../types"
import { getCryptoAdapter } from '../adapter'

require("jsonld/lib/events").safeEventHandler = ({ next }: { next: () => void }) => next()

const IV_LENGTH = 16
const ENCRYPTION_ALGORITHM = 'aes-256-cbc'

const _hashBytes = (bytes: Buffer | string) => Buffer.from(
  getCryptoAdapter().sha256.hash(Buffer.from(bytes)).substring(2), 'hex'
)

const _hash = (data: string | Buffer) => _base58().encode(_hashBytes(data))

const _createCipher = (suite: string, key: unknown, iv: unknown, isDecipher = false) => {
  let cipherType = 'createCipheriv'
  if (isDecipher) {
    cipherType = 'createDecipheriv'
  }

  suite = suite.toLowerCase()

  const adapter = getCryptoAdapter()

  return adapter.aes.encoder[cipherType](suite, key, iv)
}

const _createCipheriv = (suite: string, key: unknown, iv: unknown) => {
  return _createCipher(suite, key, iv)
}

const _createDecipheriv = (suite: string, key: unknown, iv: unknown) => {
  return _createCipher(suite, key, iv, true)
}

const _getSecp256k1 = () => ({
  sign: (msg: Uint8Array, pk: Uint8Array) =>
    getCryptoAdapter().secp.sign(msg, pk),
  verify: (sig: Uint8Array, msg: Uint8Array, pub: Uint8Array) =>
    getCryptoAdapter().secp.verify(sig, msg, pub)
})

const _base58 = (): Base58Lib => ({
  encode: getCryptoAdapter().base58.encode,
  decode: value => getCryptoAdapter().base58.toArray(getCryptoAdapter().base58.decode(value))
})


const _makeDerivationPath = (index = 0, change = 0, account = 0, bc = '0') => {
  return `m/44'/${bc}/${account}'/${change}/${index}`
}

const _makeId = (key: string, payload?: string, expand: boolean = false) => {
  const suffix = payload ? _hash(payload) : null

  if (suffix && expand) {
    return `${_hash(key)}:${suffix}}`
  }

  return _hash(`${key}${suffix ? `:${suffix}` : ''}`)
}

const _getRandomBytes = (size: number): Buffer => {
  return Buffer.from(getCryptoAdapter().random(size))
}

const _normalizePassword = (password: string) => {
  return _hashBytes(password)
}


export const nodeCryptoHelper: CryptoHelper = {
  buildSignSuite: (options) => new Secp256k1Signature({
    key: new Secp256k1Key({
      ...options,
      privateKeyHex: options.privateKey && Buffer.from(_base58().decode(options.privateKey)).toString('hex'),
      publicKeyHex: options.publicKey && Buffer.from(_base58().decode(options.publicKey)).toString('hex'),
    }),
    useNativeCanonize: false
  }),

  hash: _hash,

  hashBytes: data => _hashBytes(data).toString('base64'),

  sign: (data: string, key: string) => {
    return Buffer.from(
      _getSecp256k1().sign(_hashBytes(data), _base58().decode(key))
    ).toString('base64')
  },

  verify: (signature: string, data: string, key: string) => {
    return _getSecp256k1().verify(
      Buffer.from(signature, 'base64'),
      _hashBytes(data),
      _base58().decode(key)
    )
  },

  getRandomBytes: _getRandomBytes,

  normalizePassword: _normalizePassword,

  encrypt: async (body: string, password: string): Promise<string> => {
    const normalizedPassword = _normalizePassword(password)
    const bodyBuffer = Buffer.from(body, 'utf8')

    const iv = _getRandomBytes(IV_LENGTH)

    const cipher = _createCipheriv(ENCRYPTION_ALGORITHM, normalizedPassword, iv)
    const chiper = Buffer.concat([cipher.update(bodyBuffer), cipher.final()])

    return Buffer.concat([iv, chiper]).toString('base64')
  },

  decrypt: async (chiper: string, password: string): Promise<string> => {
    const encryptedSeedBuffer = Buffer.from(chiper, 'base64')
    const normalizedPassword = _normalizePassword(password)
    const iv = encryptedSeedBuffer.slice(0, IV_LENGTH)
    const encryptedSeedWtihoutVector = encryptedSeedBuffer.slice(IV_LENGTH)

    const decipher = _createDecipheriv(ENCRYPTION_ALGORITHM, normalizedPassword, iv)

    const decryptedBuffer = Buffer.concat([decipher.update(encryptedSeedWtihoutVector), decipher.final()])

    return decryptedBuffer.toString('utf8')
  },

  makeDerivationPath: _makeDerivationPath,

  makeId: _makeId,

  base58: _base58,

  getKey: (seed: Uint8Array, derivationPath?: string): CryptoKey & { dp: string } => {
    const bufferedSeed = seed as Buffer
    derivationPath = derivationPath || _makeDerivationPath()
    const _key = `${bufferedSeed.toString('hex')}_${derivationPath}`

    const adapter = getCryptoAdapter()
    if (!adapter._wallets[_key]) {
      adapter._wallets[_key] = adapter.WalletClass.fromSeed(seed).derivePath(derivationPath)
    }

    const pubKey = _base58().encode(
      Buffer.from(adapter._wallets[_key].publicKey.substring(2), 'hex')
    )

    return {
      dp: derivationPath,
      pk: _base58().encode(
        Buffer.from(adapter._wallets[_key].privateKey.substring(2), 'hex')
      ),
      pubKey,
      id: _makeId(pubKey)
    }
  }
}