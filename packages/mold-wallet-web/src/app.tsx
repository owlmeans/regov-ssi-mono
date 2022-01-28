import React, {
  useEffect,
  useMemo,
  useState
} from 'react'

import {
  Backdrop,
  CircularProgress,
  Container
} from '@mui/material'

import {
  i18nDefaultOptions,
  i18nSetup,
  createWalletHandler,
} from '@owlmeans/regov-lib-react'

import {
  NavigationRoot,
  createRootNavigator
} from './router'
import {
  BrowserRouter,
} from 'react-router-dom'

import { buildStorageHelper } from './storage'
import {
  WalletAppParams,
  AppProvider
} from './app/'


const i18n = i18nSetup(i18nDefaultOptions)

export const WalletApp = ({ config, extensions }: WalletAppParams) => {
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

  return <Container maxWidth="xl">
    {
      loaded
        ? <BrowserRouter>
          <AppProvider handler={handler} config={config} extensions={extensions}
            i18n={i18n} navigatorBuilder={createRootNavigator}>
            <NavigationRoot />
          </AppProvider>
        </BrowserRouter>
        : <Backdrop sx={{ color: '#fff' }} open={!loaded}>
          <CircularProgress color="inherit" />
        </Backdrop>
    }
  </Container>
}