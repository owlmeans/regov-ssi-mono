import { BuildKeyChainWrapperMethod, CreateKeyOptions, DPArgs, KeyPair, KeyRotation } from "./types"


export const buildKeyChain: BuildKeyChainWrapperMethod =
  async ({ password, source, keyOptions, crypto }) => {
    const _createKey =
      async (alias: string, password: string, options?: CreateKeyOptions): Promise<KeyPair> => {
        const type = 'BIP32'

        const safe = options?.safe || false
        const safeCommentObj = (options?.safeComment ? { safeComment: options?.safeComment } : {})

        const seed = options?.seed
          ? Buffer.from(options.seed, 'base64')
          : (await crypto.getRandomBytes(32))
        const seed64 = seed.toString('base64')
        const dp = options?.dp ? options.dp : <DPArgs>[0]
        if (dp.length < 1) {
          dp.push(0)
        }

        const commonKey = crypto.getKey(seed, crypto.makeDerivationPath.apply(null, dp))
        const nextDp = <DPArgs>[...dp]
        nextDp.unshift(<number>nextDp.shift() + 1)
        const nextKey = crypto.getKey(seed, crypto.makeDerivationPath.apply(null, nextDp))

        const rotation: KeyRotation = {
          type,
          opened: options?.opened || false,
          private: options?.opened
            ? commonKey.pk
            : await crypto.encrypt(commonKey.pk, password),
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
          private: await crypto.encrypt(nextKey.pk, password),
          public: await crypto.encrypt(nextKey.pubKey, password),
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
          seed: await crypto.encrypt(seed64, password),
          id: commonKey.id,
          safe,
          ...safeCommentObj
        }
      }

    if (!source) {
      return {
        keyChain: {
          defaultKey: '_identity',
          keys: {
            ['_identity']: await _createKey('_identity', password, keyOptions)
          }
        },

        getDefaultPassword: () => password,

        openKey: async (
          keypair: KeyPair,
          password: string,
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
            private: await crypto.decrypt(keyRotation.private, password)
          }
        },

        createKey: _createKey
      }
    }

    throw new SyntaxError('NO SOURCE DECRYPTION ALGORITHM TO RESTORE KEYCHAIN')
  }


