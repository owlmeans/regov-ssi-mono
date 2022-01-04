import React, {
  useEffect,
  FunctionComponent,
  Fragment
} from 'react'
import {
  EmptyImplProps,
  EmptyProps,
  RegovCompoentProps,
  withRegov
} from '../../common'


export const MainAuthArea: FunctionComponent<EmptyProps> = withRegov<MainAuthAreaProps>(
  {
    namespace: 'regov-wallet-main',
    transformer: wallet => ({ alias: wallet?.store.alias })
  },
  ({ navigator, t, i18n, alias, renderer: Renderer }) => {
    useEffect(() => { setImmediate(() => navigator?.assertAuth()) }, [alias])

    return alias ? <Renderer t={t} i18n={i18n} alias={alias} /> : <Fragment />
  }
)

export type MainAuthAreaProps = RegovCompoentProps<
  EmptyProps, EmptyImplProps, { alias: string | undefined }
>