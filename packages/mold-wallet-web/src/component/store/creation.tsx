import React from 'react'

import {
  useNavigator,
  NavigatorContextProvider,
  StoreCreation,
  StoreCreationNavigator,
  StoreCreationNavSuccess,
} from '@owlmeans/regov-lib-react'

import { useNavigate } from 'react-router-dom'


export const WalletStoreCreation = () => {
  const navigate = useNavigate()
  const nav = useNavigator<StoreCreationNavigator>({
    success: async (params: StoreCreationNavSuccess) => {
      navigate(`/store/login/${params.alias}`)
    },
    menu: async (location: string) => alert(`go to ${location}`)
  })

  return <NavigatorContextProvider navigator={nav}>
    <StoreCreation defaultAlias="citizen" />
  </NavigatorContextProvider>
}