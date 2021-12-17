import React, {
  FunctionComponent,
  useEffect
} from 'react'

import { CryptoHelper } from '@owlmeans/regov-ssi-common'
import { buildWalletWrapper } from '@owlmeans/regov-ssi-core'
import { UseFormReturn } from 'react-hook-form'
import {
  withRegov,
  BasicNavigator,
  WalletNavigatorMethod,
  RegovValidationRules,
  WrappedComponentProps,
  RegovCompoentProps,
  useRegov,
  EmptyProps
} from '../../common'


export const StoreLogin: FunctionComponent<StoreLoginParams> =
  withRegov<StoreLoginProps, StoreLoginNavigator>(
    'StoreLogin',
    ({ t, i18n, alias, navigator, config, renderer: Renderer }) => {
      const { handler } = useRegov()

      if (!handler.stores[alias]) {
        useEffect(() => { navigator?.home() })
      }

      const _props: StoreLoginImplProps = {
        t,
        i18n,

        name: handler.stores[alias] && handler.stores[alias].name,

        rules: storeLoginValidationRules,

        form: {
          mode: 'onChange',
          criteriaMode: 'all',
          defaultValues: { login: { password: '' } }
        },

        login: (methods, crypto) => async (data: StoreLoginFields) => {
          const loading = await navigator?.invokeLoading()
          try {
            await handler.loadStore(async (handler) => {
              return await buildWalletWrapper(
                crypto,
                data.login.password,
                handler.stores[alias],
                { prefix: config.DID_PREFIX }
              )
            })

            if (navigator?.success) {
              navigator?.success()
            }
          } catch (e) {
            methods.setError('login.alert', { type: 'wrong', message: e.message || e })
          } finally {
            loading?.finish()
          }
        }
      }

      return <Renderer {..._props} />
    },
    { namespace: 'regov-wallet-store' }
  )

export const storeLoginValidationRules: RegovValidationRules = {
  'login.password': {
    required: true,
    minLength: 8,
    maxLength: 64
  }
}

export type StoreLoginParams = {
  alias: string
} & EmptyProps

export type StoreLoginProps = RegovCompoentProps<StoreLoginParams, StoreLoginImplParams>

export type StoreLoginImplParams = {
  name: string,
  login: (
    methods: UseFormReturn<StoreLoginFields>,
    crypto: CryptoHelper
  ) => (data: StoreLoginFields) => Promise<void>
}

export type StoreLoginImplProps = WrappedComponentProps<StoreLoginImplParams>

export type StoreLoginFields = {
  login: {
    password: string
    alert: string
  }
}

export type StoreLoginNavigator = BasicNavigator & {
  success: WalletNavigatorMethod<undefined>
}