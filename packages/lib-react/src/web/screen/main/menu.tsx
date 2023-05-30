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


import { useNavigate } from 'react-router-dom-regov'
import {
  MainMenu, MainMenuNavigation, NavigatorContextProvider, useNavigator, useRegov
} from '../../../common'
import {  CREDENTIAL_LIST_ROUTE  } from '../../component'


export const WalletMainMenu = () => {
  const { handler } = useRegov()
  const navigate = useNavigate()
  const nav = useNavigator<MainMenuNavigation>({
    menu: async (item: string, params: Object) => { navigate(item, params) }
  })

  return <NavigatorContextProvider navigator={nav}>
    <MainMenu defaultItems={[
      {
        title: 'menu.logout', action: async () => {
          const loading = await nav.invokeLoading()
          await handler.logout()
          await loading.finish()
        }
      },
      {
        title: 'menu.dashboard', action: async () => {
          nav.home()
        }
      },
      {
        title: 'menu.wallet', action: async () => {
          nav.menu(CREDENTIAL_LIST_ROUTE)
        }
      }
    ]} />
  </NavigatorContextProvider>
}