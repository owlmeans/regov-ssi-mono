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


export const MainMenu: FunctionComponent<MainMenuParams> = withRegov<MainMenuProps>(
  'MainMenu',
  ({ t, i18n, defaultItems, navigator, renderer: Renderer }) => {
    const { extensions } = useRegov()

    const items = [
      ...defaultItems || [],
      ...extensions ? extensions?.getMenuItems() : []
    ].map(item => ({
      ...item, action: async () => {
        const res = typeof item.action === 'function'
          ? await item.action()
          : typeof item.action === 'string'
            ? { path: item.action }
            : item.action

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

export type ManuItemParams = {
  title: string
  action: (() => Promise<void | MenuActionResult> | MenuActionResult | void)
  | MenuActionResult
  | string
  ns?: string
  order?: number
}

export type MenuActionResult = { path: string, params?: Object }

export type MainMenuItemImplProps = WrappedComponentProps<
  MainMenuItemImplParams
>

export type MainMenuNavigation = BasicNavigator & {
  menu: WalletNavigatorMenuMethod<string, Object>
}