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
import {
  useNavigator, NavigatorContextProvider, StoreCreation, StoreCreationNavigator,
  StoreCreationNavSuccess, STORE_CREATION_MENU_IMPORT,
} from '../../../common'
import { useNavigate } from 'react-router-dom'


export const WalletStoreCreation = () => {
  const navigate = useNavigate()
  const nav = useNavigator<StoreCreationNavigator>({
    success: async (params: StoreCreationNavSuccess) => { navigate(`/store/login/${params.alias}`) },
    menu: async (location: string) => {
      switch (location) {
        default:
        case STORE_CREATION_MENU_IMPORT:
          navigate('/store/list')
      }
    }
  })

  return <NavigatorContextProvider navigator={nav}>
    <StoreCreation defaultAlias="citizen" />
  </NavigatorContextProvider>
}