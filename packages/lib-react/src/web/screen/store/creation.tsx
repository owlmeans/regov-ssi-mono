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