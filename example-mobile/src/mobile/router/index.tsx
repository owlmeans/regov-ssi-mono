/**
 *  Copyright 2022 OwlMeans
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

import React from 'react'
import { NavigationProp } from '@react-navigation/native'
import { basicNavigator, extendNavigator, WalletHandler, Config } from '@owlmeans/regov-lib-react'


export const createRootNavigator = (navigation: NavigationProp<ReactNavigation.RootParamList>, handler: WalletHandler, config: Config) =>
  extendNavigator(basicNavigator, {
    assertAuth: async () => {
      if (handler.wallet) {
        return true
      }

      if (!config.development) {
        navigation.navigate({ key: 'store/list' })
      }

      return false
    },

    checkAuth: async () => !!handler.wallet,

    home: async () => { setTimeout(() => navigation.navigate({ key: 'home' }), 100) },

    back: async () => navigation.goBack()
  })

