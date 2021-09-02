import { createSlice } from '@reduxjs/toolkit'

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

    switch: (state, { payload: current }) => {
      return {
        ...state,
        current,
        uncommited: false
      }
    },

    remove: (state, { payload: alias }) => {
      return {
        ...state,
        current: alias === state.current ? undefined : state.current,
        stores: {
          ...Object.entries(state.stores).reduce((
            stores, [key, store]
          ) => {
            return {
              ...stores,
              ...(key === alias ? {} : { [key]: store })
            }
          }, {})
        }
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