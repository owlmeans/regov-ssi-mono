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

import React, { PropsWithChildren, useState } from "react"
import { MainLoading, RegovProvider, MainModal } from "../../common"
import { useNavigate } from "react-router-dom"
import { buildDevWallet } from "../debug/util/builder"
import { WalletAppParams, RootNavigatorBuilder } from "./types"
import { webComponentMap } from "../component"
import { i18n } from "i18next"
import { WalletHandler } from "@owlmeans/regov-ssi-core"


export const AppProvider = ({
  handler, config, extensions, i18n, navigatorBuilder, children, serverClient
}: ProviderParams) => {
  const navigate = useNavigate()
  const navigator = navigatorBuilder(navigate, handler, config)
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

  return <RegovProvider i18n={i18n} map={webComponentMap} handler={handler}
    config={config} navigator={navigator} extensions={extensions} serverClient={serverClient}>
    <MainLoading nav={navigator} />
    <MainModal />
    {children}
  </RegovProvider>
}

export type ProviderParams = PropsWithChildren<WalletAppParams & {
  handler: WalletHandler
  navigatorBuilder: RootNavigatorBuilder
  i18n: i18n
}>