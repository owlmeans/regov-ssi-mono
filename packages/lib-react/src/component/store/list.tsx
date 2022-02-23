import { EncryptedStore } from '@owlmeans/regov-ssi-core'
import React, {
  FunctionComponent
} from 'react'

import {
  BasicNavigator,
  EmptyProps,
  RegovComponentProps,
  useRegov,
  WalletNavigatorMethod,
  withRegov,
  WrappedComponentProps
} from '../../common'


export const StoreList: FunctionComponent<StoreListParams> =
  withRegov<StoreListProps, StoreListNavigator>(
    'StoreList',
    ({ t, i18n, navigator, counter, renderer: Renderer }) => {
      const { handler } = useRegov()

      const _props: StoreListImplProps = {
        t, i18n,

        stores: Object.entries(handler.stores).map(([, store]) => store),

        login: (alias: string) => {
          if (navigator) {
            navigator.login(alias)
          }
        },

        create: () => {
          if (navigator) {
            navigator.create()
          }
        },

        upload: (store: EncryptedStore) => {
          if (store.alias) {
            handler.stores[store.alias] = store
            handler.notify()
          }
        },

        delete: (alias: string) => {
          if (handler.stores[alias]) {
            handler.stores[alias].toRemove = true
            handler.notify()
          }
        },

        counter
      }

      return <Renderer {..._props} />
    }, {
      namespace: 'regov-wallet-store', transformer: (_, __, handler) => {
        return { counter: Object.entries(handler?.stores || {}).length }
      }
  })

export type StoreListProps = RegovComponentProps<StoreListParams, StoreListImplParams, StoreListState, StoreListNavigator>

export type StoreListState = {
  counter: number
}

export type StoreListParams = {
} & EmptyProps

export type StoreListImplParams = {
  login: (alias: string) => void

  create: () => void

  upload: (store: EncryptedStore) => void

  delete: (alias: string) => void

  stores: EncryptedStore[]
}

export type StoreListImplProps = WrappedComponentProps<StoreListImplParams, StoreListState>

export type StoreListNavigator = BasicNavigator & {
  login: WalletNavigatorMethod<string>
  create: WalletNavigatorMethod
}