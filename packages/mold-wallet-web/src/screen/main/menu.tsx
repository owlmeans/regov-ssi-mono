import React from 'react'
import { useNavigate } from 'react-router-dom'

import {
  MainMenu,
  MainMenuNavigation,
  NavigatorContextProvider,
  useNavigator,
  useRegov
} from '@owlmeans/regov-lib-react'
import { 
  CREDENTIAL_LIST_ROUTE 
} from '../../component'


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
          await handler.loadStore(async () => undefined)
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