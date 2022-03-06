import { BasicNavigator, Config, UIExtensionRegistry, WalletHandler } from "../../common"
import { NavigateFunction } from "react-router-dom"


export type WalletAppParams = {
  config: Config
  extensions?: UIExtensionRegistry
}

export type RootNavigatorBuilder = (
  navigate: NavigateFunction, handler: WalletHandler, config: Config
) => BasicNavigator
