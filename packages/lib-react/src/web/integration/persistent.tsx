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

import { Fragment, PropsWithChildren, useEffect, useMemo, useState } from 'react'
import { buildWalletWrapper, createWalletHandler, EXTENSION_TRIGGER_AUTHENTICATED, EXTENSION_TRIGGER_INIT_SENSETIVE, InitSensetiveEventParams, WalletHandler, cryptoHelper, Credential, REGISTRY_SECTION_PEER, REGISTRY_TYPE_IDENTITIES } from '@owlmeans/regov-ssi-core'

import { i18n as I18n } from 'i18next'

import CircularProgress from '@mui/material/CircularProgress'
import { i18nDefaultOptions, i18nSetup } from '../../i18n'
import { UIExtensionRegistry } from '../../extension'
import { BasicNavigator, EXTENSION_TIRGGER_MAINMODAL_SHARE_HANDLER, MainLoading, MainModalAuthenticatedEventParams, MainModalHandle, MainModalShareEventParams, RegovProvider } from '../../common'
import { buildStorageHelper } from '../storage'
import { WalletAppParams } from '../app/types'
import { getRegovPassword, isRegovPasswordSet } from './utils'
import { webComponentMap } from '../component'
import { IntegratedWalletPlugin, UneregisterIntegratedWalletPlugin } from './types'

export const i18n = i18nSetup(i18nDefaultOptions)

let i18nInitialized: boolean = false

export const i18nRegisterExtensions = (i18n: I18n, extensions: UIExtensionRegistry) => {
  if (i18nInitialized) {
    return
  }
  i18nInitialized = true
  extensions?.uiExtensions.forEach((ext) => {
    if (ext.extension.localization) {
      Object.entries(ext.extension.localization.translations).forEach(([lng, resource]) => {
        if (ext.extension.localization?.ns) {
          i18n.addResourceBundle(lng, ext.extension.localization?.ns, resource, true, true)
        }
      })
    }
  })
}

export const WalletPersistentIntegrationReact = (
  {
    config, extensions, navigatorBuilder, children, serverClient, setInboxCount, source,
    passedHandler, renderSeed, integrationConfig, plugins, CryptoLoader
  }: PropsWithChildren<WalletPersistentIntegrationReactProps>
) => {
  const personalHandler = useMemo(() => createWalletHandler(), [source])
  const handler = passedHandler || personalHandler
  const storage = useMemo(() => buildStorageHelper(handler, config), [])
  const handle = useMemo<MainModalHandle>(
    () => ({ close: () => undefined, upgrade: () => undefined } as unknown as MainModalHandle),
    [source, 'default']
  )
  const [pluginDestructors, setPluginDestructors] = useState<undefined | UneregisterIntegratedWalletPlugin[]>(undefined)

  const [loaded, setLoaded] = useState<PasswordState>(isRegovPasswordSet() ? PasswordState.LOADING : PasswordState.NO)
  const navigator = navigatorBuilder(handler)

  const [_stateSeed, updateState] = useState(0)
  useEffect(() => handler.observe(updateState, () => _stateSeed + 1))

  useEffect(() => {
    if (loaded === PasswordState.NO && isRegovPasswordSet()) {
      setLoaded(PasswordState.LOADING)
    }
  }, [source, renderSeed])

  useEffect(() => extensions && i18nRegisterExtensions(i18n, extensions), extensions?.uiExtensions)

  // useEffect(() => { console.log('Regov:WalletPersistentIntegrationReact') }, [])

  // console.log('Regov:loaded', loaded)

  const destructors: UneregisterIntegratedWalletPlugin[] = []

  switch (loaded) {
    case PasswordState.LOADING:
      return <>
        <CryptoLoader deps={[source, isRegovPasswordSet(), storage]} onFinish={() => {
          if (!isRegovPasswordSet()) {
            return
          }
          if (storage.loaded && passedHandler && passedHandler.wallet && handler.wallet) {
            // console.log('Regov:kickoff plugins', plugins)
            const _destructors = plugins?.onKickOff?.map(plugin => plugin({
              handler, isHandlerPassed: true, isUnregisterSet: !!pluginDestructors, extensions, setInboxCount
            }))

            destructors.push(..._destructors?.filter(_ => _) as UneregisterIntegratedWalletPlugin[])
            setLoaded(PasswordState.LOADED)

            return () => {
              // console.log('Regov:nnnnn')
              destructors && destructors.forEach(destructor => destructor && destructor())
              // destructors && destructors.forEach(destructor => destructor)// && destructor())
            }
          }
          storage.init().then(async () => {
            // console.log('Regov:Kickoff store')
            if (!handler.wallet) {
              if (!handler.stores['default']) {
                const wallet = await buildWalletWrapper(
                  { crypto: cryptoHelper, extensions: extensions?.registry },
                  getRegovPassword() ?? '',
                  {
                    name: 'Default wallet',
                    alias: 'default',
                  },
                  {
                    prefix: config.DID_PREFIX,
                    defaultSchema: config.baseSchemaUrl,
                    didSchemaPath: config.DID_SCHEMA_PATH,
                  }
                )
                await extensions?.triggerEvent<InitSensetiveEventParams>(wallet, EXTENSION_TRIGGER_INIT_SENSETIVE, {
                  extensions: extensions.registry,
                })
                handler.stores[wallet.store.alias] = await wallet.export()

                handler.notify()
              }
              await handler.loadStore(async (handler) => {
                return await buildWalletWrapper(
                  { crypto: cryptoHelper, extensions: extensions?.registry },
                  getRegovPassword() ?? '',
                  handler.stores['default'],
                  {
                    prefix: config.DID_PREFIX,
                    defaultSchema: config.baseSchemaUrl,
                    didSchemaPath: config.DID_SCHEMA_PATH,
                  }
                )
              })
            }

            if (integrationConfig?.trustedIssuersUri) {
              try {
                let credentialList = (await serverClient?.getVCs<Credential[]>({
                  uri: integrationConfig.trustedIssuersUri,
                  serverAlias: 'integration',
                })) as unknown as { credentials: Credential[] }

                if (!credentialList?.credentials) {
                  credentialList = { credentials: [] }
                }

                await Promise.all(
                  credentialList.credentials.map(async (credential) => {
                    if (!handler.wallet?.getRegistry(REGISTRY_TYPE_IDENTITIES).getCredential(credential.id, REGISTRY_SECTION_PEER)) {
                      await handler.wallet?.getRegistry(REGISTRY_TYPE_IDENTITIES).addCredential(credential, REGISTRY_SECTION_PEER)
                    }
                  })
                )
                handler.notify()
              } catch (e) {
                console.error(e)
              }
            }

            if (!handler?.wallet) {
              return
            }

            await extensions?.triggerEvent<MainModalShareEventParams>(handler.wallet, EXTENSION_TIRGGER_MAINMODAL_SHARE_HANDLER, { handle })

            /**
             * @TODO handle should be able to open modals or process incomming VCs some other way
             */
            await extensions?.triggerEvent<MainModalAuthenticatedEventParams>(handler.wallet, EXTENSION_TRIGGER_AUTHENTICATED, {
              handle, config, handler, extensions
            })

            destructors.push(...plugins?.onStorageLoaded?.map(destructor => destructor({
              handler, isHandlerPassed: !!passedHandler, isUnregisterSet: !!pluginDestructors, extensions, setInboxCount
            })) as [])

            destructors?.push(...plugins?.onKickOff?.map(plugin => plugin({
              handler, isHandlerPassed: true, isUnregisterSet: !!pluginDestructors, extensions, setInboxCount
            })) as [])

            destructors && setPluginDestructors(
              destructors.filter(destructor => !!destructor) as UneregisterIntegratedWalletPlugin[]
            )

            setLoaded(PasswordState.LOADED)
          })

          return () => {
            if (!passedHandler) {
              pluginDestructors && pluginDestructors.forEach(destructor => destructor && destructor())
              // handler.logout().then(() => storage.detach())
            }
          }
        }} />
        <CircularProgress />
      </>
    case PasswordState.LOADED:
      return <RegovProvider i18n={i18n} map={webComponentMap} handler={handler}
        config={config} navigator={navigator} extensions={extensions} serverClient={serverClient}>
        {children}
        <MainLoading nav={navigator} />
      </RegovProvider>
  }

  return <Fragment>{children}</Fragment>
}

enum PasswordState { NO, LOADING, LOADED }

export type WalletPersistentIntegrationReactProps = WalletAppParams & {
  navigatorBuilder: (handler: WalletHandler) => BasicNavigator
  setInboxCount?: (count: number) => void
  source: string
  passedHandler?: WalletHandler
  renderSeed?: number
  integrationConfig?: {
    trustedIssuersUri?: string
  }
  plugins?: {
    onKickOff?: IntegratedWalletPlugin[]
    onStorageLoaded?: IntegratedWalletPlugin[]
  }
}
