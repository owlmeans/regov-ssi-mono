/**
 *  Copyright 2023 OwlMeans
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

import { useEffect, useMemo, useState } from 'react'
import { i18nDefaultOptions, i18nSetup } from '../common'
import { createWalletHandler } from '@owlmeans/regov-ssi-core'
import { NavigationRoot, createRootNavigator } from './router'
import { HashRouter } from 'react-router-dom-regov'
import { buildStorageHelper } from './storage'
import { WalletAppParams, AppProvider } from './app/'
import { i18nRegisterExtensions } from '../i18n/util'
import Backdrop from '@mui/material/Backdrop'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import CssBaseline from '@mui/material/CssBaseline'


const i18n = i18nSetup(i18nDefaultOptions)

export const WalletApp = ({ config, extensions, CryptoLoader }: WalletAppParams) => {
  const handler = useMemo(createWalletHandler, [])
  const storage = useMemo(() => buildStorageHelper(handler, config), [config])

  useEffect(() => extensions && i18nRegisterExtensions(i18n, extensions), extensions?.uiExtensions || [])

  const [loaded, setLoaded] = useState(false)

  return <CssBaseline>
    <CryptoLoader onFinish={() => {
      console.log('>>> Crypto loading finished <<<')
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
    }} />
    <Container maxWidth="xl" sx={{ pb: 10 }}>
      {
        loaded
          ? <HashRouter>
            <AppProvider handler={handler} config={config} extensions={extensions}
              i18n={i18n} navigatorBuilder={createRootNavigator}>
              <NavigationRoot />
            </AppProvider>
          </HashRouter>
          : <Backdrop sx={{ color: '#fff' }} open={!loaded}>
            <CircularProgress color="inherit" />
          </Backdrop>
      }
    </Container>
  </CssBaseline>
}