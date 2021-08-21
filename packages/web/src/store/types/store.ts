
import { PayloadAction, SliceCaseReducers } from '@reduxjs/toolkit'
import { SecureStore, EncryptedStore } from 'metabelarusid-core'

export type SecuredStoreState = {
  stores: { [key: string]: EncryptedStore }
  current?: string
}

export type SecuredStoreReducers = SliceCaseReducers<SecuredStoreState> & {
  update: (state: SecuredStoreState, action: PayloadAction<EncryptedStore> ) => SecuredStoreState
}