/**
 *  Copyright 2022 OwlMeans
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

import React, {
  useEffect, useState, useContext, createContext, FunctionComponent, PropsWithChildren,
  Fragment, FunctionComponentElement
} from 'react'
import { i18n, TFunction } from 'i18next'
import { I18nextProvider, useTranslation } from 'react-i18next'
import { RegisterOptions, UseFormProps } from 'react-hook-form'
import { createWalletHandler, ObserverTransformerOption, WalletHandler } from '@owlmeans/regov-ssi-core'
import {
  BasicNavigator, NavigatorContextProvider, WalletNavigator, NavigatorContext
} from './navigator'
import { UIExtensionRegistry } from '../extension'
import { ServerClient } from './client'


export const RegovContext = createContext<ContextParams>({
  map: {},
  handler: createWalletHandler(),
  config: {
    DID_PREFIX: 'ssitest',
    code: 'regov.wallet.app'
  }
})

export const useRegov = () => {
  return useContext(RegovContext)
}

export const RegovProvider = ({
  map, handler, i18n, navigator, config, extensions, serverClient, children
}: PropsWithChildren<ContextProviderParams>) => {
  const props = { map, handler, config, extensions, serverClient }

  return <I18nextProvider i18n={i18n}>
    <NavigatorContextProvider navigator={navigator}>
      <RegovContext.Provider value={props}>{children}</RegovContext.Provider>
    </NavigatorContextProvider>
  </I18nextProvider>
}

type InferState<Type extends RegovComponentProps> = Type extends RegovComponentProps<any, any, infer State> ? State : never
type InferProps<Type extends RegovComponentProps> = Type extends RegovComponentProps<infer Props, any, any> ? Props : never

export const withRegov = <
  Type extends RegovComponentProps = RegovComponentProps,
  Nav extends WalletNavigator = BasicNavigator,
  Transformer extends ObserverTransformerOption<
    InferState<Type>, InferProps<Type>
  > = ObserverTransformerOption<InferState<Type>, InferProps<Type>>
>(
  name: string | RegovHOCOptions<Transformer>,
  Com: FunctionComponent<Type>,
  options?: RegovHOCOptions<Transformer>
) => {
  type T = InferProps<Type>
  // type I = Type extends RegovComponentProps<any,  infer Impl, any> ? Impl : never
  type S = InferState<Type>

  return ((props: PropsWithChildren<T>): FunctionComponentElement<T> => {
    if (typeof name !== 'string') {
      options = name
      if (options.name) {
        name = options.name
      } else {
        name = UNKNOWN_COMPONENT
      }
    }
    const transformer = options?.transformer

    const { handler, map, config, serverClient, extensions } = useRegov()
    const navigator = useContext(NavigatorContext)
    const { t, i18n } = useTranslation(props.ns || options?.namespace)
    const state: S = (transformer ? transformer(handler.wallet, props, handler) : {}) as S

    const [, setState] = useState<S>(state)
    useEffect(() => {
      if (transformer) {
        return handler.observe(setState, (wallet) => {
          return transformer(wallet, props, handler)
        })
      }

      return () => undefined
    })

    if (typeof name !== 'string') {
      name = UNKNOWN_COMPONENT
    }
    /**
     * @TODO Fix typing the way the casting through unknown isn't required
     */
    const _props = {
      renderer: map[name] || (_ => <Fragment>{props.children}</Fragment>),
      navigator: navigator as Nav,
      config: config,
      client: serverClient,
      extensions, handler, t, i18n, ...props, ...state,
    } as unknown as Type

    return <Com {..._props} />
  }) as FunctionComponent<T>
}


export type RegovComponentProps<
  Type extends EmptyProps = EmptyProps,
  Props extends EmptyImplProps = EmptyImplProps,
  State extends EmptyState = EmptyState,
  Nav extends WalletNavigator = BasicNavigator
  > = PropsWithChildren<{
    renderer: FunctionComponent<WrappedComponentProps<Props, State>>
    config: Config
    extensions?: UIExtensionRegistry
    handler?: WalletHandler
    client?: ServerClient
    navigator?: Nav
    t: TFunction
    i18n: i18n
  } & Type & State>

export type WrappedComponentProps<
  Props extends EmptyImplProps = EmptyImplProps,
  State extends EmptyState = EmptyState
  > = PropsWithChildren<Props & State & {
    t: TFunction
    i18n: i18n
    rules?: RegovValidationRules
    form?: UseFormProps
  }>


export type RegovValidationRules = {
  [key: string]: RegisterOptions
}

export type RegovHOCOptions<
  Transformer extends ObserverTransformerOption = ObserverTransformerOption
  > = {
    namespace?: string
    name?: string,
    transformer?: Transformer
  }

export type ContextParams = {
  map: ImplementationMap,
  handler: WalletHandler,
  config: Config,
  serverClient?: ServerClient
  extensions?: UIExtensionRegistry
}

export type Config = {
  DID_PREFIX: string
  DID_SCHEMA_PATH?: string
  development?: boolean
  baseSchemaUrl?: string
  code: string
  name?: string
  logo?: JSX.Element
  urls?: {
    privacyPolicy?: string
    terms?: string
    guides?: string
  }
}

export type ContextProviderParams = ContextParams & {
  navigator: BasicNavigator,
  i18n: i18n
}

export type ImplementationMap = {
  [key: string]: FunctionComponent<any>
}

export type EmptyProps = {
  ns?: string
}

export type EmptyState = {
}

export type EmptyImplProps = {
}

export const UNKNOWN_COMPONENT = 'UNKNOWN'