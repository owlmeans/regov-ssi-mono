import {
  createSlice,
  /* createAsyncThunk*/
} from '@reduxjs/toolkit'

import { IdentityState, IdentityReducers } from './types/identity'

const slice = createSlice<IdentityState, IdentityReducers>({
  name: 'identity',

  initialState: {
    created: false,
  },

  reducers: {
    tip: (state) => {
      return { 
        ...state, 
        created: true
      }
    }
  },
})

export const actions = slice.actions

export const reducer = slice.reducer