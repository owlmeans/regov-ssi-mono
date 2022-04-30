import { WalletAppParams } from '../app/types'
import {
  i18nDefaultOptions, i18nSetup, BasicNavigator, RegovProvider, MainLoading
} from '../../common'
import React, { PropsWithChildren, useEffect, useMemo } from 'react'
import { buildStorageHelper } from '../storage'
import { i18nRegisterExtensions } from '../../i18n/util'
import { webComponentMap } from '../component'
import { createWalletHandler, WalletHandler } from '@owlmeans/regov-ssi-core'


const i18n = i18nSetup(i18nDefaultOptions)

export const WalletIntergationReact = (
  { config, extensions, navigatorBuilder, children, serverClient }: PropsWithChildren<
    WalletAppParams & {
      navigatorBuilder: (handler: WalletHandler) => BasicNavigator
    }>
) => {
  const handler = useMemo(createWalletHandler, [])
  const storage = useMemo(() => buildStorageHelper(handler, config), [config])
  // const [loaded, setLoaded] = useState(false)

  const navigator = navigatorBuilder(handler)

  useEffect(() => extensions && i18nRegisterExtensions(i18n, extensions), extensions?.uiExtensions || [])

  useEffect(() => {
    storage.init().then(
      async _ => {
        console.info('STORE INITIALIZED')
        // setLoaded(true)
      }
    )

    return () => {
      console.info('STORE DETACHED')
      storage.detach()
    }
  }, [storage])

  return /* loaded ? */ <RegovProvider i18n={i18n} map={webComponentMap} handler={handler}
      config={config} navigator={navigator} extensions={extensions} serverClient={serverClient}>
      {children}
      <MainLoading nav={navigator} />
    </RegovProvider>
    // : <Backdrop sx={{ color: '#fff' }} open={!loaded}>
    //   <CircularProgress color="inherit" />
    // </Backdrop>
}