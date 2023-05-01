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

import React, { FunctionComponent, ReactNode, useEffect, useMemo } from 'react'
import { EventParams, EXTENSION_TRIGGER_AUTHENTICATED, WalletHandler } from '@owlmeans/regov-ssi-core'
import {
  RegovComponentProps, useRegov, withRegov, WrappedComponentProps, Config
} from '../../common/'
import { CastMainModalParams, UIExtensionRegistry } from '../../extension'


export const MainModal: FunctionComponent<MainModalParams> = withRegov<MainModalProps>(
  'MainModal', props => {
    const { i18n, t, alias, renderer: Renderer } = props
    const { extensions, handler, config } = useRegov()
    const handle: MainModalHandle = useMemo(() => ({
      close: () => handle.setOpen && handle.setOpen(false),
      
      upgrade: params => {
        return {
          ...handle, close: () => {
            params.cleanUp && params.cleanUp()
            handle.close && handle.close()
          }
        }
      }
    }), [alias])
    const _props = { i18n, t, alias, handle }
    useEffect(() => {
      (async () => {
        if (handler.wallet && extensions?.triggerEvent) {
          await extensions.triggerEvent<MainModalShareEventParams>(
            handler.wallet, EXTENSION_TIRGGER_MAINMODAL_SHARE_HANDLER, { handle }
          )

          await extensions.triggerEvent<MainModalAuthenticatedEventParams>(
            handler.wallet, EXTENSION_TRIGGER_AUTHENTICATED, { handle, config, handler, extensions }
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
  extensions: UIExtensionRegistry
}

export type MainModalParams = {
}

export type MainModalState = {
  alias: string | undefined
}

export type MainModalProps = RegovComponentProps<
  MainModalParams, MainModalImplParams, MainModalState
>

export type MainModalImplParams = {
  handle: MainModalHandle,
}

export type MainModalHandle = {
  getContent?: () => ReactNode
  setOpen?: (isOpened: boolean) => void
  open?: (content: () => ReactNode) => boolean
  close: () => void
  upgrade: (params: CastMainModalParams) => MainModalHandle
}

export type MainModalImplProps = WrappedComponentProps<MainModalImplParams, MainModalState>

export type MainModalShareEventParams = EventParams & {
  handle: MainModalHandle
}

export const EXTENSION_TIRGGER_MAINMODAL_SHARE_HANDLER = 'regov:wallet:sharehandler'