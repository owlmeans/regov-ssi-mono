import React, {
  FunctionComponent
} from 'react'
import {
  BasicNavigator,
  EmptyProps,
  EmptyState,
  RegovCompoentProps,
  useRegov,
  WalletNavigatorMenuMethod,
  withRegov,
  WrappedComponentProps
} from '../../common'
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

export type MainMenuProps = RegovCompoentProps<
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