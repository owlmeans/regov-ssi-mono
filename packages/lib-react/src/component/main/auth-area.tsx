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

import { useEffect, FunctionComponent, Fragment, ReactNode } from 'react'
import { EmptyProps, RegovComponentProps, useRegov, withRegov, WrappedComponentProps } from '../../common/'


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

export type MainAuthAreaProps = RegovComponentProps<
  MainAuthAreaParams, MainAuthAreaImplProps, MainAuthAraeState
>

export type MainAuthAreaImplParams = {
  name: string
  menu?: ReactNode
}

export type MainAuthAreaImplProps = WrappedComponentProps<
  MainAuthAreaImplParams, MainAuthAraeState
>
