/**
 *  Copyright 2023 OwlMeans
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { WalletHandler } from '@owlmeans/regov-ssi-core'

import { NavigateFunction, Route, Routes, useParams } from 'react-router-dom-regov'
import {
  basicNavigator, extendNavigator, MainAuthArea, MainDashboard, useRegov, Config,
  EXTENSION_ITEM_PURPOSE_ROUTE
} from '../../common'
import {
  WalletStoreCreation, WalletStoreLogin, WalletStoreList, WalletCredentialList, WalletMainMenu,
  CredentialCreation, CredentialRequest, CredentialClaim
} from '../screen'


export const NavigationRoot = () => {
  const { extensions } = useRegov()

  return <Routes>
    <Route path="/" element={<MainAuthArea menu={<WalletMainMenu />} />}>
      <Route path="" element={<MainDashboard />} />
      {extensions?.produceComponent(EXTENSION_ITEM_PURPOSE_ROUTE).map(ext => {
        const Renderer = () => {
          const params = useParams()
          return <ext.com {...params} />
        }
        return ext.params && <Route key={`${ext.extensionCode}-${ext.params.path}`}
          path={ext.params.path as string} element={<Renderer />}
        />
      })}
      <Route path="credential">
        <Route path="list/:tab/:section" element={<WalletCredentialList />} />
        <Route path="list/:tab/:section/:id" element={<WalletCredentialList />} />
        <Route path="create/:ext/:type" element={<CredentialCreation />} />
        <Route path="request/:ext/:type" element={<CredentialRequest />} />
        <Route path="claim/:ext/:type" element={<CredentialClaim />} />
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

