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

import React, { PropsWithChildren, useEffect, useState } from "react"
import { MainLoading, RegovProvider, WalletHandler, MainModal } from "@owlmeans/regov-lib-react"
import { useNavigation } from '@react-navigation/native'
import { buildDevWallet } from "../debug/util/builder"
import { WalletAppParams, RootNavigatorBuilder } from "./types"
// import { webComponentMap } from "../component"
import { i18n } from "i18next"


export const AppProvider = ({
  handler, config, extensions, i18n, navigatorBuilder, children
}: ProviderParams) => {
  const navigation = useNavigation()
  const navigator = navigatorBuilder(navigation, handler, config)
  const [firstLoad, setFirstLoad] = useState(true)
  if (config.development) {
    const storedAssertAuth = navigator.assertAuth
    navigator.assertAuth = async () => {
      if (firstLoad && !handler.wallet) {
        const wallet = await buildDevWallet(config)
        handler.stores[wallet.store.alias] = await wallet.export()
        await handler.loadStore(async _ => wallet)
        setFirstLoad(false)

        return true
      }

      return storedAssertAuth()
    }
  }

  navigator.assertAuth()

  return <RegovProvider i18n={i18n} map={{}} handler={handler}
    config={config} navigator={navigator} extensions={extensions}>
    {children}
  </RegovProvider>
}

export type ProviderParams = PropsWithChildren<WalletAppParams & {
  handler: WalletHandler
  navigatorBuilder: RootNavigatorBuilder
  i18n: i18n
}>