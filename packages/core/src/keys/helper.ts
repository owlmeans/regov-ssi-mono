import { CommonContext } from "common/types"
import { CommonKey } from "common/types/key"
import { SignCredentialOptions } from "credential/types"
import { KeyPair } from "keys/types"


export type KeyChainHelperOptions = {
  rotation?: number
  id?: string
}


export const _keyChainHelper = {

  keyToCommonKey: async (
    context: CommonContext,
    key: KeyPair,
    password: string,
    options?: KeyChainHelperOptions
  ): Promise<CommonKey> => {

    let keyRotation = key.rotations[
      options?.rotation !== undefined ? options?.rotation : key.currentRotation
    ]

    if (!keyRotation.opened) {
      keyRotation = await context.keyChain.openKey(
        key,
        password,
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
  parseSigningKeyOptions: (context: CommonContext, options: SignCredentialOptions): KeyPair => {
    switch (typeof options.key) {
      default:
      case 'boolean':
        if (options.key) {
          throw new SyntaxError('AUTO KEY CREATION IS NOT IMPLEMENTED')
        } else {
          options.key = context.keyChain.keyChain.defaultKey
        }
      case 'string':
        options.key = context.keyChain.keyChain.keys[options.key]
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