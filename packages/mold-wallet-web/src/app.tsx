import React, {
  useState
} from 'react'

import { Container } from '@mui/material'

import {
  i18nDefaultOptions,
  i18nSetup,
  RegovProvider,
  createWalletHandler,
  Config,
  WalletHandler,
  MainLoading,
  UIExtensionRegistry,
} from '@owlmeans/regov-lib-react'
import { webComponentMap } from '@owlmeans/regov-lib-react-web'

import {
  NavigationRoot,
  createRootNavigator
} from './router'
import {
  BrowserRouter,
  useNavigate
} from 'react-router-dom'

import { buildDevWallet } from './debug/util/builder'


const i18n = i18nSetup(i18nDefaultOptions)

export const WalletApp = ({ config, extensions }: WalletAppParams) => {
  const handler = createWalletHandler()

  extensions?.uiExtensions.forEach(ext => {
    if (ext.extension.localization) {
      Object.entries(ext.extension.localization.translations).forEach(([lng, resource]) => {
        if (ext.extension.localization?.ns) {
          i18n.addResourceBundle(lng, ext.extension.localization?.ns, resource, true, true)
        }
      })
    }
  })

  return <Container maxWidth="xl">
    <BrowserRouter>
      <Provider handler={handler} config={config} extensions={extensions} />
    </BrowserRouter>
  </Container>
}

export type WalletAppParams = {
  config: Config
  extensions?: UIExtensionRegistry
}

const Provider = ({ handler, config, extensions }: { handler: WalletHandler } & WalletAppParams) => {
  const navigate = useNavigate()
  const navigator = createRootNavigator(navigate, handler)
  const [firstLoad, setFirstLoad] = useState(true)
  if (config.development) {
    const storedAssertAuth = navigator.assertAuth
    navigator.assertAuth = async () => {
      if (firstLoad && !handler.wallet) {
        const wallet = await buildDevWallet(config.DID_PREFIX)
        handler.stores[wallet.store.alias] = await wallet.export()
        await handler.loadStore(async _ => wallet)
        setFirstLoad(false)

        return true
      }

      return storedAssertAuth()
    }
  }

  return <RegovProvider i18n={i18n} map={webComponentMap} handler={handler}
    config={config} navigator={navigator} extensions={extensions}>
    <MainLoading nav={navigator} />
    <NavigationRoot />
  </RegovProvider>
}
