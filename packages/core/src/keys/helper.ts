import { CryptoKey } from "metabelarusid-common"
import { SignCredentialOptions } from "credential/types"
import { KeyChainWrapper, KeyPair } from "keys/types"


export type KeyChainHelperOptions = {
  rotation?: number
  id?: string
}

// @TODO Refactor it into something reasonable.
// Everything is wrong here with the code structure.
// Idea: Move it to KeyChainWrapper
export const _keysHelper = {
  keyToCryptoKey: async (
    keys: KeyChainWrapper,
    key: KeyPair,
    password?: string,
    options?: KeyChainHelperOptions
  ): Promise<CryptoKey> => {

    let keyRotation = key.rotations[
      options?.rotation !== undefined ? options?.rotation : key.currentRotation
    ]

    if (!keyRotation.opened) {
      keyRotation = await keys.openKey(
        key,
        password || keys.getDefaultPassword(),
        options?.rotation
      )
    }

    return {
      id: options?.id || key.id,
      pk: keyRotation.private,
      pubKey: keyRotation.public
    }
  },

  // @TODO Add implemnetation on syntax errors
  // @TODO Refactor it: choose only one proper approach and use it instead of 
  // this 'convenient' solution
  parseSigningKeyOptions: (keys: KeyChainWrapper, options: SignCredentialOptions): KeyPair => {
    switch (typeof options.key) {
      default:
      case 'boolean':
        if (options.key) {
          throw new SyntaxError('AUTO KEY CREATION IS NOT IMPLEMENTED')
        } else {
          options.key = keys.keys.defaultKey
        }
      case 'string':
        options.key = keys.keys.keys[options.key]
      case 'object':
        if (options.key.hasOwnProperty('issuer')) {
          throw new SyntaxError('CAN\'T LOOK UP KEY BY ISSUER')
        } else {
          options.key = options.key as KeyPair
        }
    }

    return options.key
  }
}