import {
  createSlice,
  /* createAsyncThunk*/
} from '@reduxjs/toolkit'

import { CredentialReducers, CredentialState } from './types/credential'

const slice = createSlice<CredentialState, CredentialReducers>({
  name: 'credential',

  initialState: {
  },

  reducers: {
    claim: (state, { payload: claim }) => {
      return { 
        ...state, 
        currentClaim: claim
      }
    },

    cleanUp: (state) => {
      return {
        ...state,
        currentClaim: undefined,
        claim: undefined,
        signed: undefined,
        credential: undefined
      }
    },

    review: (state, {payload: claim}) => {
      return {
        ...state,
        claim
      }
    },

    sign: (state, {payload: signed}) => {
      return {
        ...state,
        claim: undefined,
        signed
      }
    },

    verify: (state, {payload: credential}) => {
      return {
        ...state,
        credential
      }
    }
  },
})

export const actions = slice.actions

export const reducer = slice.reducer