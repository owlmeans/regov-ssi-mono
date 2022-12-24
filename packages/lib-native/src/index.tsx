import { buildWalletWrapper, createWalletHandler, webCryptoHelper } from '@owlmeans/regov-ssi-core'
import React, { useEffect, useMemo } from 'react'
import { View, Text } from 'react-native'


export const HelloWorld = () => {
  const handler = useMemo(createWalletHandler, [])

  useEffect(() => {
    (async () => {
      handler.wallet = await await buildWalletWrapper(
        { crypto: webCryptoHelper }, '11111111', { alias: 'default', name: 'Development wallet' }, {
        prefix: 'exm',
        defaultSchema: 'https://schema.owlmeans.com',
        didSchemaPath: 'did-schema.json',
      })
      console.log(handler.wallet)
    })()
  }, [])

  return <View>
    <Text>Hello world</Text>
  </View>
}
