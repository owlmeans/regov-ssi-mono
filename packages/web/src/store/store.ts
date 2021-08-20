import {
  createSlice,
  /* createAsyncThunk*/
} from '@reduxjs/toolkit'

const slice = createSlice({
  name: 'store',

  initialState: {
  },

  reducers: {
    init: (state) => {
      return { ...state }
    }
  },
})

export const actions = slice.actions

export const reducer = slice.reducer