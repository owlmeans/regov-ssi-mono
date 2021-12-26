import { Wallet } from "../wallet/types"


export type BasicStore = {
  alias: string
  name: string
  comment?: string
}

export type EncryptedStore = BasicStore & {
  dataChunks?: string[]
  toRemove?: boolean
}

export type SecureStore = BasicStore & {
  data?: Wallet
}

export const ERROR_STORE_CANT_DECRYPT = 'ERROR_STORE_CANT_DECRYPT'