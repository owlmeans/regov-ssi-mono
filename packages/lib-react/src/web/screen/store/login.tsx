import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { NavigatorContextProvider, StoreLogin, StoreLoginNavigator, useNavigator } from '../../../common'


export const WalletStoreLogin = () => {
  const { alias } = useParams()
  const navigate = useNavigate()
  const nav = useNavigator<StoreLoginNavigator>({
    success: async () => { navigate('/') },

    list: async () => { navigate('/store/list') }
  })

  return <NavigatorContextProvider navigator={nav}>
    <StoreLogin alias={alias || 'citizen'} />
  </NavigatorContextProvider>
}