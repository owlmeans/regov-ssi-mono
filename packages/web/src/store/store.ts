import {
  createSlice,
  /* createAsyncThunk*/
} from '@reduxjs/toolkit'

import { SecuredStoreReducers, SecuredStoreState } from './types/store'

const slice = createSlice<SecuredStoreState, SecuredStoreReducers>({
  name: 'store',

  initialState: {
    stores: {},
  },

  reducers: {
    update: (state, { payload: store }) => {
      return { 
        ...state, 
        current: store.alias,
        stores: {
          ...state.stores,
          [store.alias]: store
        },
        uncommited: false
      }
    },

    tip: (state) => {
      return {
        ...state,
        uncommited: true
      }
    }
  },
})

export const actions = slice.actions

export const reducer = slice.reducer