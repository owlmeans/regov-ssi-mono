import React, {
  FunctionComponent,
  ReactNode,
  useEffect,
  useMemo,
} from 'react'
import {
  EventParams,
  EXTENSION_TRIGGER_AUTHENTICATED
} from '@owlmeans/regov-ssi-extension'
import {
  RegovComponetProps,
  useRegov,
  withRegov,
  WrappedComponentProps,
  Config,
  WalletHandler
} from '../../common'


export const MainModal: FunctionComponent<MainModalParams> = withRegov<MainModalProps>(
  'MainModal', props => {
    const { i18n, t, alias, renderer: Renderer } = props
    const { extensions, handler, config } = useRegov()
    const handle = useMemo<MainModalHandle>(() => ({}), [alias])
    const _props = { i18n, t, alias, handle }
    useEffect(() => {
      (async () => {
        if (handler.wallet && extensions?.triggerEvent) {
          await extensions.triggerEvent<MainModalShareEventParams>(
            handler.wallet, EXTENSION_TIRGGER_MAINMODAL_SHARE_HANDLER, { handle }
          )

          await extensions.triggerEvent<MainModalAuthenticatedEventParams>(
            handler.wallet, EXTENSION_TRIGGER_AUTHENTICATED, { handle, config, handler }
          )
        }
      })()
    }, [alias])

    return <Renderer {..._props} />
  },
  { namespace: 'regov-wallet-flow', transformer: (wallet) => ({ alias: wallet?.store.alias }) }
)

export type MainModalAuthenticatedEventParams = EventParams & {
  handle: MainModalHandle
  config: Config
  handler: WalletHandler
}

export type MainModalParams = {

}

export type MainModalState = {
  alias: string | undefined
}

export type MainModalProps = RegovComponetProps<
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

export type MainModalShareEventParams = EventParams & {
  handle: MainModalHandle
}

export const EXTENSION_TIRGGER_MAINMODAL_SHARE_HANDLER = 'regov:wallet:sharehandler'