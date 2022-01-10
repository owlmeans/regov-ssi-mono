import React, {
  FunctionComponent,
  ReactNode,
  useEffect,
  useMemo,
} from 'react'
import {
  EventParams,
  EXTESNION_TRIGGER_AUTHENTICATED
} from '@owlmeans/regov-ssi-extension'
import {
  RegovCompoentProps,
  useRegov,
  withRegov,
  WrappedComponentProps
} from '../../common'


export const MainModal: FunctionComponent<MainModalParams> = withRegov<MainModalProps>(
  'MainModal', props => {
    const { i18n, t, alias, renderer: Renderer } = props
    const { extensions, handler } = useRegov()
    const handle = useMemo<MainModalHandle>(() => ({}), [alias])
    const _props = { i18n, t, alias, handle }
    useEffect(() => {
      if (handler.wallet && extensions?.triggerEvent) {
        extensions.triggerEvent<MainModalEventTriggerParams>(
          handler.wallet, EXTESNION_TRIGGER_AUTHENTICATED, { handle }
        )
      }
    }, [alias])

    return <Renderer {..._props} />
  },
  {
    namespace: 'regov-wallet-flow',
    transformer: (wallet) => {
      return { alias: wallet?.store.alias }
    }
  }
)

export type MainModalEventTriggerParams = EventParams<string> & {
  handle: MainModalHandle,
}

export type MainModalParams = {

}

export type MainModalState = {
  alias: string | undefined
}

export type MainModalProps = RegovCompoentProps<
  MainModalParams, MainModalImplParams, MainModalState
>

export type MainModalImplParams = {
  handle: MainModalHandle,
}

export type MainModalHandle = {
  getContent?: () => ReactNode
  setOpen?: (isOpened: boolean) => void
}

export type MainModalImplProps = WrappedComponentProps<MainModalImplParams, MainModalState>