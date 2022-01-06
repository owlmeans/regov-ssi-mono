import React, {
  PropsWithChildren,
  useState
} from "react"
import {
  MainLoading,
  RegovProvider,
  WalletHandler,
  MainModal
} from "@owlmeans/regov-lib-react"
import { useNavigate } from "react-router-dom"
import { buildDevWallet } from "../debug/util/builder"
import {
  WalletAppParams,
  RootNavigatorBuilder
} from "./types"
import { webComponentMap } from "../component"
import { i18n } from "i18next"


export const AppProvider = ({
  handler, config, extensions, i18n, navigatorBuilder, children
}: ProviderParams) => {
  const navigate = useNavigate()
  const navigator = navigatorBuilder(navigate, handler)
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
    config={config} navigator={navigator} extensions={extensions}>
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