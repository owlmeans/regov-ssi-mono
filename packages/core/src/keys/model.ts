import {
  BuildKeyChainWrapperMethod, CreateKeyOptions, DPArgs, KeyChain, KEYCHAIN_DEFAULT_KEY,
  KEYCHAIN_ERROR_NO_KEY, KEYCHAIN_ERROR_WRONG_DP, KeyPair, KeyPairToCryptoKeyOptions,
  KeyRotation
} from "./types"
import { CryptoKey, COMMON_CRYPTO_ERROR_ISNOTFULL } from '../common'


export const buildKeyChain: BuildKeyChainWrapperMethod =
  async ({ password, source, keyOptions, crypto }) => {
    const _createKeyBuilder = (keys?: KeyChain) =>
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

    const _keyPairToCryptoKey = (keys: KeyChain) =>
      async (
        key?: KeyPair | string, _password?: string, options?: KeyPairToCryptoKeyOptions
      ): Promise<CryptoKey> => {
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
          keyRotation = await _openKey(
            key,
            _password || password,
            options?.rotation
          )
        }

        return {
          id: options?.id || key.id,
          pk: keyRotation.private,
          pubKey: keyRotation.public,
          nextKeyDigest: keyRotation.nextDigest ? crypto.hash(keyRotation.nextDigest) : undefined
        }
      }

    
    const keys = source || {
      defaultKey: KEYCHAIN_DEFAULT_KEY,
      keys: {
        [KEYCHAIN_DEFAULT_KEY]: await _createKeyBuilder()(KEYCHAIN_DEFAULT_KEY, password, keyOptions)
      }
    }

    return {
      keys,

      getDefaultPassword: () => password,

      openKey: _openKey,

      getCryptoKey: _keyPairToCryptoKey(keys),

      createKey: _createKeyBuilder(keys),

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


