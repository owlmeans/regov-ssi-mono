import React from 'react'

import {
  NavigateFunction,
  Route,
  Routes,
} from 'react-router-dom'

import {
  basicNavigator,
  extendNavigator,
  MainDashboard,
  useRegov,
  WalletHandler,
} from '@owlmeans/regov-lib-react'
import {
  WalletStoreCreation,
  WalletStoreLogin,
  WalletMainAuthArea
} from '../component'

import {
  EXTENSION_ITEM_PURPOSE_ROUTE
} from '@owlmeans/regov-ssi-extension'


export const NavigationRoot = () => {
  const { extensions } = useRegov()

  return <Routes>
    <Route path="/" element={<WalletMainAuthArea />}>
      <Route path="" element={<MainDashboard />} />
      {
        extensions?.produceComponent(EXTENSION_ITEM_PURPOSE_ROUTE).map(
          ext => {
            return ext.params
              && <Route key={`${ext.extensionCode}:${ext.params.path}`}
                path={ext.params.path as string} element={<ext.com />} />
          }
        )
      }
    </Route>

    <Route path="/store">
      <Route path="create" element={<WalletStoreCreation />} />
      <Route path="login/:alias" element={<WalletStoreLogin />} />
    </Route>

  </Routes>
}

export const createRootNavigator = (navigate: NavigateFunction, handler: WalletHandler) =>
  extendNavigator(basicNavigator, {
    assertAuth: async () => {
      if (handler.wallet) {
        return true
      }
      navigate('/store/create')

      return false
    },

    checkAuth: async () => !!handler.wallet,

    home: async () => { setTimeout(() => navigate('/'), 100) },

    back: async () => navigate(-1)
  })

