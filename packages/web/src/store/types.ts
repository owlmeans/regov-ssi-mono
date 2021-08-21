export * from './types/store'

import { IdentityState } from './types/identity'
import { SecuredStoreState } from "./types/store"

export type RootState = {
  store: SecuredStoreState
  identity: IdentityState
}