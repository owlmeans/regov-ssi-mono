import React from 'react'
import { useNavigator, NavigatorContextProvider, StoreList, StoreListNavigator } from '../../../common'
import { useNavigate } from 'react-router-dom'


export const WalletStoreList = () => {
  const navigate = useNavigate()
  const nav = useNavigator<StoreListNavigator>({
    login: async (alias: string) => { navigate(`/store/login/${alias}`) },

    create: async () => { navigate('/store/create') }
  })

  return <NavigatorContextProvider navigator={nav}>
    <StoreList />
  </NavigatorContextProvider>
}