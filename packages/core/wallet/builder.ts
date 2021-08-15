import { KeyChain, KeyPair } from 'cryptowrapper/types'
import {
  BasicWallet,
  CredentialsEntity,
  CredentialsWallet,
  CREDENTIALS_TYPE_KEY_PERMISSION,
  IdentityEntity,
  IdentityWallet,
  KeysWallet,
  WalletContext
} from 'wallet/types'

export const _transformToIdentityWallet =
  async (wallet: BasicWallet<IdentityEntity>, context: WalletContext): Promise<IdentityWallet> => {
    let identity: IdentityEntity = <IdentityEntity>wallet.typeSpecificData || {}
    return {
      ...wallet, identity
    }
  }

export const _transformToCredentialsWallet =
  async (wallet: BasicWallet<CredentialsEntity>, context: WalletContext): Promise<CredentialsWallet> => {
    const permissionType = context.getCredentialsType(CREDENTIALS_TYPE_KEY_PERMISSION)

    return {
      ...wallet,
      ...Object.entries(wallet.didIndex).reduce(
        (memo, [, { type, id }]) => {
          const newPermissions = [], newCredentials = []
          if (type.includes(permissionType)) {
            newPermissions.push(id)
          } else {
            newCredentials.push(id)
          }
          return {
            permissions: [
              ...memo.permissions, ...newPermissions
            ],
            credentials: [
              ...memo.credentials, ...newCredentials
            ]
          }
        },
        <{ permissions: string[], credentials: string[] }>{ permissions: [], credentials: [] }
      )
    }
  }

export const _transformToKeysWallet =
  async (wallet: BasicWallet<KeyPair>, context: WalletContext): Promise<KeysWallet> => {
    let keyChain: KeyChain = wallet.typeSpecificData
    if (!keyChain?.intialized) {
      keyChain = await context.crypto.generateKeyChain({ empty: true })
    }
    keyChain.keys = wallet.didIndex
    return {
      ...wallet,
      keyChain
    }
  }