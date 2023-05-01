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

import React, {
  createContext,
  PropsWithChildren,
  useContext
} from "react"


export const basicNavigator: BasicNavigator = {
  assertAuth: async () => true,
  checkAuth: async () => true,
  home: async () => { },
  back: async () => { },
  invokeLoading: async () => ({
    finish: () => { },
    error: (_) => { },
    success: (_) => { }
  })
}

export const NavigatorContext = createContext<BasicNavigator>(basicNavigator)

export const NavigatorContextProvider = <T extends WalletNavigator = BasicNavigator>(
  { navigator, children }: PropsWithChildren<{ navigator: T }>
) => {
  return <NavigatorContext.Provider value={navigator as BasicNavigator}> {children} </NavigatorContext.Provider>
}

export const extendNavigator = <
  InNav extends WalletNavigator = WalletNavigator,
  OutNav extends WalletNavigator = WalletNavigator
>(inNav: InNav, out: OutNav) => {
  return { ...inNav, ...out }
}

export const useNavigator = <
  Naviagtor extends WalletNavigator = WalletNavigator
>(navigator?: Partial<Naviagtor>): Naviagtor => {
  const nav = useContext(NavigatorContext)

  return (navigator ? extendNavigator(nav, navigator) : nav) as Naviagtor
}

export const patchNavigator = <
  InNav extends WalletNavigator = WalletNavigator,
  ExtNav extends WalletNavigator = WalletNavigator
>(inNav: InNav & ExtNav, ext: ExtNav) => {
  Object.entries(ext).forEach(([key, value]) => inNav[key] = value)
}

export type BasicNavigator = WalletNavigator<{}, string> & {
  assertAuth: () => Promise<boolean>
  checkAuth: () => Promise<boolean>
  home: WalletNavigatorMethod<undefined>
  back: WalletNavigatorMethod<undefined>
  invokeLoading: () => Promise<NavigatorLoading>
}

export type WalletNavigator<
  Params extends {} = {},
  Item extends string | {} = string
  > = {
    assertAuth?: () => Promise<boolean>
    checkAuth?: () => Promise<boolean>
    interrupt?: WalletNavigatorMethod<Params>
    resume?: WalletNavigatorMethod<Params>
    home?: WalletNavigatorMethod<undefined>
    success?: WalletNavigatorMethod<Params>
    back?: WalletNavigatorMethod<undefined>
    previous?: WalletNavigatorMethod<undefined>
    next?: WalletNavigatorMethod<undefined>
    failure?: WalletNavigatorMethod<Params>
    cancel?: WalletNavigatorMethod<Params>
    menu?: WalletNavigatorMenuMethod<Item, Params>
    invokeLoading?: () => Promise<NavigatorLoading>
  }

export type NavigatorLoading = {
  finish: () => void
  error: (err?: string | Error, type?: string) => void
  success: (message: string) => void
}

export type WalletNavigatorMethod<Params extends {} | undefined = {}>
  = ((params?: Params) => Promise<void>)
  | (() => Promise<void>)

export type WalletNavigatorMenuMethod<
  Item extends string | {} = string,
  Params extends {} = {}
  > = (item: Item, params?: Params) => Promise<void>