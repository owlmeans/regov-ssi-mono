
import { SliceCaseReducers } from '@reduxjs/toolkit'

export type IdentityState = {
  created?: boolean
}

export type IdentityReducers = SliceCaseReducers<IdentityState> & {
  tip: (state: IdentityState ) => IdentityState
}