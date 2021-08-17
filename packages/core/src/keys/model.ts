import { cryptoHelper } from "common/crypto/helper"
import { BuildKeyChainWrapperMethod, CreateKeyOptions, DPArgs, KeyPair, KeyRotation } from "./types"


export const buildKeyChain: BuildKeyChainWrapperMethod =
  async (password, source, keyOptions?: CreateKeyOptions ) => {
    if (!source) {
      return {
        keyChain: {
          defaultKey: '_identity',
          keys: {
            ['_identity']: await keyChainHelper.createKey('_identity', password, keyOptions)
          }
        },

        getDefaultPassword: () => password
      }
    }

    throw new SyntaxError('NO SOURCE DECRYPTION ALGORITHM TO RESTORE KEYCHAIN')
  }


export const keyChainHelper = {
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
      private: await cryptoHelper.decrypt(keyRotation.private, password)
    }
  },

  createKey: async (
    alias: string,
    password: string,
    options?: {
      seed?: string
      opened?: boolean
      safe?: boolean
      safeComment?: string
      dp?: DPArgs
    }
  ): Promise<KeyPair> => {
    const type = 'BIP32'

    const safe = options?.safe || false
    const safeCommentObj = (options?.safeComment ? { safeComment: options?.safeComment } : {})

    const seed = options?.seed
      ? Buffer.from(options.seed, 'base64')
      : (await cryptoHelper.getRandomBytes(32))
    const seed64 = seed.toString('base64')
    const dp = options?.dp ? options.dp : <DPArgs>[0]
    if (dp.length < 1) {
      dp.push(0)
    }

    const commonKey = cryptoHelper.getKey(seed, cryptoHelper.makeDerivationPath.apply(null, dp))
    const nextDp = <DPArgs>[...dp]
    nextDp.unshift(<number>nextDp.shift() + 1)
    const nextKey = cryptoHelper.getKey(seed, cryptoHelper.makeDerivationPath.apply(null, nextDp))

    const rotation: KeyRotation = {
      type,
      opened: options?.opened || false,
      private: options?.opened
        ? commonKey.pk
        : await cryptoHelper.encrypt(commonKey.pk, password),
      public: commonKey.pubKey,
      digest: commonKey.id,
      nextDigest: cryptoHelper.sign(commonKey.id, nextKey.pk),
      safe,
      dp,
      future: false,
      ...safeCommentObj
    }

    const nextRotation: KeyRotation = {
      type,
      opened: false,
      private: await cryptoHelper.encrypt(nextKey.pk, password),
      public: await cryptoHelper.encrypt(nextKey.pubKey, password),
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
      seed: await cryptoHelper.encrypt(seed64, password),
      id: commonKey.id,
      safe,
      ...safeCommentObj
    }
  }
}