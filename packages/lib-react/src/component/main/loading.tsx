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

import React, { FunctionComponent } from 'react'
import { 
  BasicNavigator, EmptyProps, NavigatorLoading, RegovComponentProps, withRegov, WrappedComponentProps
} from '../../common/'


export const MainLoading: FunctionComponent<MainLoadingParams> = withRegov<MainLoadingProps>(
  'MainLoading',
  ({ t, i18n, nav, renderer: Renderer }) => {
    const handle: LoadingHandle = {}

    nav.invokeLoading = async () => {
      handle.open && handle.open()

      let finishCalled = false
      const _handle: NavigatorLoading = {
        finish: () => {
          finishCalled = true
          setTimeout(() => handle.close && handle.close(), 100)
        },

        success: (message) => {
          handle.error
            ? handle.error(message, 'success')
            : handle?.close && handle.close()
        },

        error: (err?, type = 'error') => handle.error
          ? handle.error(err || 'error.default', type)
          : handle?.close && handle.close()
      }

      /**
       * @TODO take waiting time from the config
       */
      setTimeout(() => !finishCalled && _handle.error(), 30000)

      await new Promise(resolve => setTimeout(resolve, 100))

      return _handle
    }

    return <Renderer t={t} i18n={i18n} handle={handle} />
  },
  { namespace: 'regov-wallet-main' }
)


export type MainLoadingProps = RegovComponentProps<MainLoadingParams, MainLoadingImplProps>

export type MainLoadingParams = {
  nav: BasicNavigator
} & EmptyProps

export type MainLoadingImplProps = WrappedComponentProps<MainLoadingImplParams>

export type MainLoadingImplParams = {
  handle: LoadingHandle
}

export type LoadingHandle = {
  open?: () => void
  close?: () => void
  error?: (err: string | Error, type?: string) => void
}