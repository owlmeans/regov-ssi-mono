import React, {
  useContext
} from 'react'

import {
  extendNavigator,
  NavigatorContext,
  NavigatorContextProvider,
  StoreCreation,
  StoreCreationNavigator,
  StoreCreationNavSuccess
} from '@owlmeans/regov-lib-react'


export default {
  component: StoreCreation,
  title: 'Components/StoreCreation',
}

export const Main = () => {
  const navigator = useContext(NavigatorContext)
  const nav: StoreCreationNavigator = extendNavigator(navigator, {
    success: async (params: StoreCreationNavSuccess) => alert(JSON.stringify(params)),
    menu: async (location) => alert(`go to ${location}`)
  })

  return <NavigatorContextProvider navigator={nav}>
    <StoreCreation defaultAlias="citizen" />
  </NavigatorContextProvider>
}