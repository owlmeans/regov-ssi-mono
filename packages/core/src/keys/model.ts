import { COMMON_CRYPTO_ERROR_ISNOTFULL, COMMON_CRYPTO_ERROR_NOPUBKEY } from "../../../common/src"
import { BuildKeyChainWrapperMethod, CreateKeyOptions, DPArgs, KeyChain, KEYCHAIN_ERROR_NO_KEY, KeyPair, KeyPairToCryptoKeyOptions, KeyRotation } from "./types"
import { CryptoKey } from 'metabelarusid-common'


export const buildKeyChain: BuildKeyChainWrapperMethod =
  async ({ password, source, keyOptions, crypto }) => {
    const _createKey =
      async (alias: string, _password?: string, options?: CreateKeyOptions): Promise<KeyPair> => {
        const type = 'BIP32'

        const safe = options?.safe || false
        const safeCommentObj = (options?.safeComment ? { safeComment: options?.safeComment } : {})

        const seed = options?.seed
          ? crypto.base58().decode(options.seed)
          : (await crypto.getRandomBytes(32))
        const seed64 = crypto.base58().encode(seed)
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
          opened: options?.opened || false,
          private: options?.opened
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

        return {
          type,
          dp: dp,
          currentRotation: 0,
          rotations: [rotation, nextRotation],
          alias,
          seed: await crypto.encrypt(seed64, _password || password),
          id: commonKey.id,
          safe,
          ...safeCommentObj
        }
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
          pubKey: keyRotation.public
        }
      }

    if (!source) {
      const keys = {
        defaultKey: '_identity',
        keys: {
          ['_identity']: await _createKey('_identity', password, keyOptions)
        }
      }

      return {
        keys,

        getDefaultPassword: () => password,

        openKey: _openKey,

        getCryptoKey: _keyPairToCryptoKey(keys),

        createKey: _createKey
      }
    }

    throw new SyntaxError('NO SOURCE DECRYPTION ALGORITHM TO RESTORE KEYCHAIN')
  }


