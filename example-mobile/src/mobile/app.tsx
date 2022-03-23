/**
 *  Copyright 2022 OwlMeans
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import React, { useEffect, useMemo, useState } from 'react'
// import { Container } from '@mui/material'
import { View, Text, StatusBar } from 'react-native'
import { i18nDefaultOptions, i18nSetup, createWalletHandler } from '@owlmeans/regov-lib-react'
import { createRootNavigator } from './router'
//  import { HashRouter } from 'react-router-dom'
import { buildStorageHelper } from './storage'
import { AppProvider } from './app/index'
import { WalletAppParams } from './app/index'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

const Stack = createNativeStackNavigator()

const i18n = i18nSetup(i18nDefaultOptions)

export const WalletAppMobile = ({ config, extensions }: WalletAppParams) => {
  const handler = useMemo(createWalletHandler, [])
  const storage = useMemo(() => buildStorageHelper(handler, config), [config])

  useEffect(() => {
    extensions?.uiExtensions.forEach(ext => {
      if (ext.extension.localization) {
        Object.entries(ext.extension.localization.translations).forEach(([lng, resource]) => {
          if (ext.extension.localization?.ns) {
            i18n.addResourceBundle(lng, ext.extension.localization?.ns, resource, true, true)
          }
        })
      }
    })
  }, extensions?.uiExtensions || [])

  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    storage.init().then(
      async _ => {
        console.info('STORE INITIALIZED')
        setLoaded(true)
      }
    )

    return () => {
      console.info('STORE DETACHED')
      storage.detach()
    }
  }, [storage])

  return <NavigationContainer>
    <AppProvider handler={handler} config={config} extensions={extensions}
      i18n={i18n} navigatorBuilder={createRootNavigator}>
      <Stack.Navigator>
        <Stack.Screen name="home" options={{title: 'xxx'}}>
          {() => <View>
            <Text>Hello world!</Text>
            <StatusBar />
          </View>}
        </Stack.Screen>
      </Stack.Navigator>
    </AppProvider>
  </NavigationContainer>
}

