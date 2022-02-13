import {
  BasicNavigator,
  Config,
  UIExtensionRegistry,
  WalletHandler
} from "@owlmeans/regov-lib-react"
import { NavigateFunction } from "react-router-dom"


export type WalletAppParams = {
  config: Config
  extensions?: UIExtensionRegistry
}

export type RootNavigatorBuilder = (
  navigate: NavigateFunction, handler: WalletHandler, config: Config
) => BasicNavigator
