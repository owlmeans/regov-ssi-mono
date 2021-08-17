import { Secp256k1Key, Secp256k1Signature } from "@affinidi/tiny-lds-ecdsa-secp256k1-2019"

import { KeysService } from '@affinidi/common'
import { fromSeed, BIP32Interface } from 'bip32'
import { CommonKey } from "common/types/key"
import { CryptoContext } from "crypto/types"

// import * as secp256k1 from 'secp256k1'

const IV_LENGTH = 16
const ENCRYPTION_ALGORITHM = 'aes-256-cbc'

const _keysCache: { [key: string]: BIP32Interface } = {}

const _hashBytes = (bytes: Buffer | string) => KeysService.sha256(bytes)

const _hash = (data: string) => _hashBytes(data).toString('base64')

const _createCipher = (suite: string, key: unknown, iv: unknown, isDecipher = false) => {
  const aes = require('browserify-aes/browser')
  const aesModes = require('browserify-aes/modes')

  let cipherType = 'createCipheriv'
  if (isDecipher) {
    cipherType = 'createDecipheriv'
  }

  suite = suite.toLowerCase()

  if (aesModes[suite]) {
    return aes[cipherType](suite, key, iv)
  }

  throw new Error('invalid suite type')
}

const _createCipheriv = (suite: string, key: unknown, iv: unknown) => {
  return _createCipher(suite, key, iv)
}

const _createDecipheriv = (suite: string, key: unknown, iv: unknown) => {
  return _createCipher(suite, key, iv, true)
}

const _getSecp256k1 = () => {
  const secp256k1 = require('secp256k1')

  return {
    sign: (msg: Uint8Array, pk: Uint8Array) =>
      secp256k1.ecdsaSign(msg, pk).signature,
    verify: (sig: Uint8Array, msg: Uint8Array, pub: Uint8Array) =>
      secp256k1.ecdsaVerify(sig, msg, pub)
  }
}

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

const _getRandomBytes = async (size: number): Promise<Buffer> => {
  return require('crypto').randomBytes(size)
}


export const nodeCryptoContext: CryptoContext = {
  buildSignSuite: (options) => new Secp256k1Signature({
    key: new Secp256k1Key({
      ...options,
      privateKeyHex: Buffer.from(options.privateKey, 'base64').toString('hex'),
      publicKeyHex: Buffer.from(options.publicKey, 'base64').toString('hex'),
    })
  }),

  hash: _hash,

  sign: (data: string, key: string) => {
    const arr = _getSecp256k1().sign(_hashBytes(data), Buffer.from(key, 'base64'))
    return Buffer.from(arr).toString('base64')
  },

  verify: (signature: string, data: string, key: string) => {
    return _getSecp256k1().verify(
      Buffer.from(signature, 'base64'),
      _hashBytes(data),
      Buffer.from(key, 'base64')
    )
  },

  getRandomBytes: _getRandomBytes,

  normalizePassword: (password: string) => {
    return KeysService.normalizePassword(password) as Uint8Array
  },

  encrypt: async (body: string, password: string): Promise<string> => {
    const normalizedPassword = KeysService.normalizePassword(password)
    const bodyBuffer = Buffer.from(body, 'utf8')

    const iv = await _getRandomBytes(IV_LENGTH)

    const cipher = _createCipheriv(ENCRYPTION_ALGORITHM, normalizedPassword, iv)
    const chiper = Buffer.concat([cipher.update(bodyBuffer), cipher.final()])

    return Buffer.concat([iv, chiper]).toString('base64')
  },

  decrypt: async (chiper: string, password: string): Promise<string> => {
    const encryptedSeedBuffer = Buffer.from(chiper, 'base64')
    const normalizedPassword = KeysService.normalizePassword(password)
    const iv = encryptedSeedBuffer.slice(0, IV_LENGTH)
    const encryptedSeedWtihoutVector = encryptedSeedBuffer.slice(IV_LENGTH)

    const decipher = _createDecipheriv(ENCRYPTION_ALGORITHM, normalizedPassword, iv)

    const decryptedBuffer = Buffer.concat([decipher.update(encryptedSeedWtihoutVector), decipher.final()])

    return decryptedBuffer.toString('utf8')
  },

  makeDerivationPath: _makeDerivationPath,

  makeId: _makeId,

  getKey: (seed: Uint8Array, derivationPath?: string): CommonKey & { dp: string } => {
    const bufferedSeed = <Buffer>seed
    derivationPath = derivationPath || _makeDerivationPath()
    const _key = `${bufferedSeed.toString('hex')}_derivationPath`

    if (!_keysCache[_key]) {
      _keysCache[_key] = fromSeed(bufferedSeed).derivePath(derivationPath)
    }

    const pubKey = _keysCache[_key].publicKey.toString('base64')

    return {
      dp: derivationPath,
      pk: (<Buffer>_keysCache[_key].privateKey).toString('base64'),
      pubKey,
      id: _makeId(pubKey)
    }
  }
}