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

import { FunctionComponent } from 'react'
import {
  BasicNavigator, EmptyProps, EmptyState, RegovComponentProps, useRegov,
  WalletNavigatorMenuMethod, withRegov, WrappedComponentProps
} from '../../common/'
import { castMenuItemParams } from '../../extension/helper'
import { ManuItemParams } from '../../extension/types'


export const MainMenu: FunctionComponent<MainMenuParams> = withRegov<MainMenuProps>(
  'MainMenu',
  ({ t, i18n, defaultItems, navigator, renderer: Renderer }) => {
    const { extensions } = useRegov()

    const items = [
      ...defaultItems || [],
      ...extensions ? extensions?.getMenuItems() : []
    ].map(item => ({
      ...item, action: async () => {
        const res = await castMenuItemParams(item)

        res && navigator?.menu(res.path, res.params)
      }
    }))

    return <Renderer i18n={i18n} t={t} items={items} />
  },
  { namespace: 'regov-wallet-main' }
)

export type MainMenuParams = {
  defaultItems?: ManuItemParams[]
} & EmptyProps

export type MainMenuProps = RegovComponentProps<
  MainMenuParams, MainMenuImplParams, EmptyState, MainMenuNavigation
>

export type MainMenuImplParams = {
  items: MainMenuItemImplParams[]
}

export type MainMenuImplProps = WrappedComponentProps<MainMenuImplParams>

export type MainMenuItemImplParams = {
  title: string
  action: () => Promise<void>
  ns?: string
}

export type MainMenuItemImplProps = WrappedComponentProps<
  MainMenuItemImplParams
>

export type MainMenuNavigation = BasicNavigator & {
  menu: WalletNavigatorMenuMethod<string, Object>
}

export const MENU_TAG_MAIN = 'main'