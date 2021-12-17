import React from 'react'

import {
  useNavigate,
  useParams
} from 'react-router-dom'

import {
  NavigatorContextProvider,
  StoreLogin,
  StoreLoginNavigator,
  useNavigator
} from '@owlmeans/regov-lib-react'


export const WalletStoreLogin = () => {
  const { alias } = useParams()
  const navigate = useNavigate()
  const nav = useNavigator<StoreLoginNavigator>({
    success: async () => navigate('/')
  })

  return <NavigatorContextProvider navigator={nav}>
    <StoreLogin alias={alias || 'citizen'} />
  </NavigatorContextProvider>
}