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

import React, { useEffect, useMemo } from 'react'
// import { Container } from '@mui/material'
import { View, Text, StatusBar } from 'react-native'
import { i18nDefaultOptions, i18nSetup, createWalletHandler, } from '../common'
import { createRootNavigator } from './router'
//  import { HashRouter } from 'react-router-dom'
//  import { buildStorageHelper } from './storage'
import { AppProvider } from './app/'
import { WalletAppParams } from '../web/app/types'


const i18n = i18nSetup(i18nDefaultOptions)

export const WalletAppMobile = ({ config, extensions }: WalletAppParams) => {
  console.log('try xxxx')
  const handler = useMemo(createWalletHandler, [])
  //  const storage = useMemo(() => buildStorageHelper(handler, config), [config])

  console.log('mobile')
  useEffect(() => {
    console.log('adding extensions')
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

  // const [loaded, setLoaded] = useState(false)

  //  useEffect(() => {
  //    storage.init().then(
  //      async _ => {
  //        console.info('STORE INITIALIZED')
  //        setLoaded(true)
  //      }
  //    )

  //    return () => {
  //      console.info('STORE DETACHED')
  //      storage.detach()
  //    }
  //  }, [storage])

  return <AppProvider handler={handler} config={config} extensions={extensions}
    i18n={i18n} navigatorBuilder={createRootNavigator}>
    <View>
      <Text>Hello world!</Text>
      <StatusBar />
    </View>
  </AppProvider>
}