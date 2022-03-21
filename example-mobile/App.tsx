import { WalletAppMobile, buildUIExtensionRegistry } from '@owlmeans/regov-lib-react/dist/native'
import React from 'react'
import { config } from './config'

const registry = buildUIExtensionRegistry()
export default function App() {
  console.log('zzzz')
  //   return <View>
  //   <Text>Hello world!</Text>
  //   <StatusBar />
  // </View>
  return <WalletAppMobile config={config} extensions={registry.normalize()} />
}

