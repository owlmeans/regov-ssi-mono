import React from 'react'

import {
  NavigateFunction,
  Route,
  Routes,
} from 'react-router-dom'

import {
  basicNavigator,
  extendNavigator,
  MainAuthArea,
  MainDashboard,
  useRegov,
  WalletHandler,
  EXTENSION_ITEM_PURPOSE_ROUTE,
  Config,
} from '@owlmeans/regov-lib-react'
import {
  WalletStoreCreation,
  WalletStoreLogin,
  WalletStoreList,
  WalletCredentialList,
  WalletMainMenu,
  CredentialCreation,
} from '../screen'


export const NavigationRoot = () => {
  const { extensions } = useRegov()

  return <Routes>
    <Route path="/" element={<MainAuthArea menu={<WalletMainMenu />} />}>
      <Route path="" element={<MainDashboard />} />
      {extensions?.produceComponent(EXTENSION_ITEM_PURPOSE_ROUTE).map(ext => {
        return ext.params && <Route key={`${ext.extensionCode}-${ext.params.path}`}
          path={ext.params.path as string} element={<ext.com />} />
      })}
      <Route path="credential">
        <Route path="list/:tab/:section" element={<WalletCredentialList />} />
        <Route path="create/:ext/:type" element={<CredentialCreation />} />
      </Route>
    </Route>

    <Route path="/store">
      <Route path="list" element={<WalletStoreList />} />
      <Route path="create" element={<WalletStoreCreation />} />
      <Route path="login/:alias" element={<WalletStoreLogin />} />
    </Route>

  </Routes>
}

export const createRootNavigator = (navigate: NavigateFunction, handler: WalletHandler, config: Config) =>
  extendNavigator(basicNavigator, {
    assertAuth: async () => {
      if (handler.wallet) {
        return true
      }

      if (!config.development) {
        navigate('/store/list')
      }

      return false
    },

    checkAuth: async () => !!handler.wallet,

    home: async () => { setTimeout(() => navigate('/'), 100) },

    back: async () => navigate(-1)
  })

