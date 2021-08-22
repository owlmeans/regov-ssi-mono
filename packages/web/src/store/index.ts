import { createStore, applyMiddleware, compose, combineReducers } from 'redux'

import thunk from 'redux-thunk'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import { reducer as storeReducer } from './store'
import { reducer as identityReducer } from './identity'
import { reducer as credentialReducer } from './credential'
import { Store } from '@reduxjs/toolkit'

import { RootState } from './types'

export { actions as storeActions } from './store'
export { actions as identityActions } from './identity'
export { actions as credentialActions } from './credential'


const composeEnhancers =
  process.env.NODE_ENV === 'development'
    && (window as any)?.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? (window as any)?.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ // window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({ trace: true, traceLimit: 25 })
    : compose

const reducer = combineReducers({
  store: storeReducer,
  identity: identityReducer,
  credential: credentialReducer
})

export const store: Store<RootState> = createStore(
  persistReducer(
    { storage, key: 'root', whitelist: ['store'] },
    reducer
  ),
  composeEnhancers(applyMiddleware(thunk))
)

export const persistor = persistStore(store)

export type AppDispatch = typeof store.dispatch