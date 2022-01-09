import React, {
  useEffect,
  FunctionComponent,
  Fragment,
  ReactNode
} from 'react'
import {
  EmptyProps,
  RegovCompoentProps,
  useRegov,
  withRegov,
  WrappedComponentProps
} from '../../common'


export const MainAuthArea: FunctionComponent<MainAuthAreaParams> = withRegov<MainAuthAreaProps>(
  {
    name: 'MainAuthArea', namespace: 'regov-wallet-main',
    transformer: wallet => ({ alias: wallet?.store.alias })
  },
  ({ navigator, t, i18n, alias, menu, renderer: Renderer }) => {
    const { config } = useRegov()
    useEffect(() => { setImmediate(() => navigator?.assertAuth()) }, [alias])

    const _props = {
      t, i18n, alias, menu,
      name: (config.name || t('auth-area.no-name')) as string
    }

    return alias ? <Renderer {..._props} /> : <Fragment />
  }
)

export type MainAuthAreaParams = EmptyProps & {
  menu?: ReactNode
}

export type MainAuthAraeState = {
  alias: string | undefined
}

export type MainAuthAreaProps = RegovCompoentProps<
  MainAuthAreaParams, MainAuthAreaImplProps, MainAuthAraeState
>

export type MainAuthAreaImplParams = {
  name: string
  menu?: ReactNode
}

export type MainAuthAreaImplProps = WrappedComponentProps<
  MainAuthAreaImplParams, MainAuthAraeState
>
