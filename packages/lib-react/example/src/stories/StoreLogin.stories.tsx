import React, {
  useContext,
  useEffect,
  useState
} from 'react'
import {
  extendNavigator,
  NavigatorContext,
  NavigatorContextProvider,
  RegovContext,
  StoreLogin,
  StoreLoginNavigator
} from '@owlmeans/regov-lib-react'
import { buildWalletWrapper } from '@owlmeans/regov-ssi-core'
import { webCryptoHelper } from '@owlmeans/regov-ssi-common'

export default {
  component: StoreLogin,
  title: 'Components/StoreLogin'
}

export const Main = () => {
  const navigator = useContext(NavigatorContext)
  const { handler, config } = useContext(RegovContext)
  const [alias, setAlias] = useState('')

  const nav: StoreLoginNavigator = extendNavigator(navigator, {
    success: async () =>  alert('success')
  })

  useEffect(() => {
    (async () => {
      console.log('Create testing wallet')
      const wallet = await buildWalletWrapper(
        webCryptoHelper,
        '11111111',
        {
          name: 'Default wallet',
          alias: 'default',
        },
        { prefix: config.DID_PREFIX }
      )
      handler.stores['default'] = await wallet.export()
      setAlias('default')
    })()
  }, [])

  return <NavigatorContextProvider navigator={nav}>
    <StoreLogin alias={alias} />
  </NavigatorContextProvider>
}

