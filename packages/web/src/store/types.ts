export * from './types/store'

import { IdentityState } from './types/identity'
import { SecuredStoreState } from "./types/store"
import { CredentialState } from "./types/credential"

export type RootState = {
  store: SecuredStoreState
  identity: IdentityState
  credential: CredentialState
}