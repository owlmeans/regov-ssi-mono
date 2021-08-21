export * from './types/store'

import { SecuredStoreState } from "./types/store"

export type RootState = {
  store: SecuredStoreState
}