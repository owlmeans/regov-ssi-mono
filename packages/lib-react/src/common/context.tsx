import React, {
  useEffect,
  useState,
  useContext,
  createContext,
  FunctionComponent,
  PropsWithChildren,
  Fragment,
  FunctionComponentElement
} from 'react'

import {
  i18n,
  TFunction
} from 'i18next'
import {
  I18nextProvider,
  useTranslation
} from 'react-i18next'
import {
  RegisterOptions,
  UseFormProps
} from 'react-hook-form'
import { WalletWrapper } from '@owlmeans/regov-ssi-core'

import {
  createWalletHandler,
  ObserverTransformerOption,
  WalletHandler
} from './wallet'
import {
  BasicNavigator,
  NavigatorContextProvider,
  WalletNavigator,
  NavigatorContext
} from './navigator'
import { UIExtensionRegistry } from '../extension'


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
  map, handler, i18n, navigator, config, extensions, children
}: PropsWithChildren<ContextProviderParams>) => {
  const props = { map, handler, config, extensions }

  return <I18nextProvider i18n={i18n}>
    <NavigatorContextProvider navigator={navigator}>
      <RegovContext.Provider value={props}>{children}</RegovContext.Provider>
    </NavigatorContextProvider>
  </I18nextProvider>
}

export const withRegov = <
  Type extends RegovComponentProps = RegovComponentProps,
  Nav extends WalletNavigator = BasicNavigator,
  Transformer extends ObserverTransformerOption = ObserverTransformerOption<
    Type extends RegovComponentProps<any, any, infer State> ? State : never,
    Type extends RegovComponentProps<infer Props, any, any> ? Props : never
  >
>(
  name: string | RegovHOCOptions<Transformer>,
  Com: FunctionComponent<Type>,
  options?: RegovHOCOptions<Transformer>
) => {
  type T = Type extends RegovComponentProps<infer Props, any, any> ? Props : never
  type S = Type extends RegovComponentProps<any, any, infer State> ? State : never

  return ((props: PropsWithChildren<T>): FunctionComponentElement<Type> => {
    if (typeof name !== 'string') {
      options = name
      if (options.name) {
        name = options.name
      } else {
        name = UNKNOWN_COMPONENT
      }
    }
    const transformer = options?.transformer

    const { handler, map, config } = useRegov()
    const navigator = useContext(NavigatorContext)
    const { t, i18n } = useTranslation(props.ns || options?.namespace)
    const state: S = (transformer ? transformer(handler.wallet, props, handler) : {}) as S

    const [, setState] = useState<S>(state)
    useEffect(() => {
      if (transformer) {
        // console.log('Register transformer')
        return handler.observe(setState, (wallet: WalletWrapper) => {
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
      t, i18n, ...props, ...state
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
  extensions?: UIExtensionRegistry
}

export type Config = {
  DID_PREFIX: string
  DID_SCHEMA_PATH?: string
  development?: boolean
  baseSchemaUrl?: string
  code: string
  name?: string
}

export type ContextProviderParams = ContextParams & {
  navigator: BasicNavigator,
  i18n: i18n
}

export type ImplementationMap = {
  [key: string]: FunctionComponent
}

export type EmptyProps = {
  ns?: string
}

export type EmptyState = {
}

export type EmptyImplProps = {
}

export const UNKNOWN_COMPONENT = 'UNKNOWN'