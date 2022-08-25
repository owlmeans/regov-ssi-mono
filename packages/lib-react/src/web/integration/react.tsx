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

import { WalletAppParams } from '../app/types'
import {
  i18nDefaultOptions, i18nSetup, BasicNavigator, RegovProvider, MainLoading
} from '../../common'
import React, { PropsWithChildren, useEffect, useMemo, useState } from 'react'
import { buildStorageHelper } from '../storage'
import { i18nRegisterExtensions } from '../../i18n/util'
import { webComponentMap } from '../component'
import { 
  buildWalletWrapper, createWalletHandler, EXTENSION_TRIGGER_INIT_SENSETIVE, InitSensetiveEventParams, 
  WalletHandler, webCryptoHelper 
} from '@owlmeans/regov-ssi-core'
import { DEFAULT_GUEST_WALLET_ALIAS } from '../types'
import CircularProgress from '@mui/material/CircularProgress'


const i18n = i18nSetup(i18nDefaultOptions)

export const WalletIntegrationReact = (
  { config, extensions, navigatorBuilder, children, serverClient }: PropsWithChildren<
    WalletAppParams & {
      navigatorBuilder: (handler: WalletHandler) => BasicNavigator
    }>
) => {
  const handler = useMemo(createWalletHandler, [])
  const storage = useMemo(() => buildStorageHelper(handler, config), [config])

  useEffect(() => {
    (async () => {
      if (!handler.wallet) {
        const wallet = await buildWalletWrapper(
          { crypto: webCryptoHelper, extensions: extensions?.registry }, '11111111',
          { alias: DEFAULT_GUEST_WALLET_ALIAS, name: 'Guest wallet' }, {
          prefix: config.DID_PREFIX,
          defaultSchema: config.baseSchemaUrl,
          didSchemaPath: config.DID_SCHEMA_PATH,
        })
        handler.stores[wallet.store.alias] = await wallet.export()
        await extensions?.triggerEvent<InitSensetiveEventParams>(
          wallet, EXTENSION_TRIGGER_INIT_SENSETIVE, {
          extensions: extensions.registry
        })
        await handler.loadStore(async _ => wallet)
      }
    })()
  }, [])

  const [loaded, setLoaded] = useState(false)

  const navigator = navigatorBuilder(handler)

  useEffect(
    () => extensions && i18nRegisterExtensions(i18n, extensions), extensions?.uiExtensions || []
  )

  useEffect(() => {
    storage.init().then(
      async _ => {
        console.info('STORE INITIALIZED')
        setLoaded(true)
      }
    )

    return () => {
      console.info('STORE DETACHED');
      (async () => {
        await handler.logout()
        storage.detach()
      })()
    }
  }, [storage])
  
  return loaded
    ? <RegovProvider i18n={i18n} map={webComponentMap} handler={handler}
      config={config} navigator={navigator} extensions={extensions} serverClient={serverClient}>
      {children}
      <MainLoading nav={navigator} />
    </RegovProvider>
    : <CircularProgress color="inherit" />
}