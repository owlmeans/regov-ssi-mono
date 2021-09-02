
import { PayloadAction, SliceCaseReducers } from '@reduxjs/toolkit'
import { SecureStore, EncryptedStore } from 'metabelarusid-core'

export type SecuredStoreState = {
  stores: { [key: string]: EncryptedStore }
  current?: string
  uncommited?: boolean
}

export type SecuredStoreReducers = SliceCaseReducers<SecuredStoreState> & {
  update: (state: SecuredStoreState, action: PayloadAction<EncryptedStore> ) => SecuredStoreState

  switch: (state: SecuredStoreState, action: PayloadAction<string>) => SecuredStoreState

  remove: (state: SecuredStoreState, action: PayloadAction<string>) => SecuredStoreState

  tip: (state: SecuredStoreState) => SecuredStoreState
}