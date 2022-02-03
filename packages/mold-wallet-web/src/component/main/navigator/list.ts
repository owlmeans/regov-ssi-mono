import {
  BasicNavigator,
  WalletNavigator, WalletNavigatorMenuMethod
} from "@owlmeans/regov-lib-react"
import { RegistryType } from "@owlmeans/regov-ssi-core"
import { NavigateFunction } from "react-router-dom"


export type ListNavigator = WalletNavigator & BasicNavigator & {
  item: WalletNavigatorMenuMethod<RegistryType, ListNavigatorItemParams>
}

export type ListNavigatorItemParams = { section: string, id: string }

export const partialListNavigator = (navigate: NavigateFunction): {
  item: WalletNavigatorMenuMethod<RegistryType, ListNavigatorItemParams>
} => ({
  item: async (registry, { section, id }: ListNavigatorItemParams) => {
    navigate(`/credential/list/${registry}/${section}/${id}`)
  }
})