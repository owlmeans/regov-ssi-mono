import React, {
  FunctionComponent,
} from 'react'
import { UseFormReturn } from 'react-hook-form'
import { CryptoHelper } from '@owlmeans/regov-ssi-common'
import {
  buildWalletWrapper
} from '@owlmeans/regov-ssi-core'

import {
  BasicNavigator,
  EmptyProps,
  RegovComponentProps,
  RegovValidationRules,
  useRegov,
  WalletNavigatorMenuMethod,
  WalletNavigatorMethod,
  withRegov,
  WrappedComponentProps
} from '../../common'
import { 
  generalNameVlidation,
  loginAliasValidation, 
  passwordValidation 
} from '../../util'


export const StoreCreation: FunctionComponent<StoreCreationParams> =
  withRegov<StoreCreationProps, StoreCreationNavigator>(
    'StoreCreation',
    ({ t, i18n, defaultAlias, config, navigator, renderer: Renderer }) => {
      const { handler } = useRegov()

      const _props: StoreCreationImplProps = {
        t,

        i18n,

        rules: storeCreationValidationRules,

        form: {
          mode: 'onChange',
          criteriaMode: 'all',
          defaultValues: {
            creation: {
              name: t('creation.name.default'),
              login: defaultAlias,
              password: {
                input: '',
                confirm: ''
              }
            }
          }
        },

        create: (methods, crypto) => async (data) => {
          const loading = await navigator?.invokeLoading()
          try {
            if (data.creation.password.input !== data.creation.password.confirm) {
              loading?.error(t('creation.password.confirm.error.equal'))
              methods.setError('creation.password.confirm', { type: 'equal' })
              return
            }

            const wallet = await buildWalletWrapper(
              crypto,
              data.creation.password.input,
              {
                name: data.creation.name,
                alias: data.creation.login,
              },
              { 
                prefix: config.DID_PREFIX,
                defaultSchema: config.baseSchemaUrl,
                didSchemaPath: config.DID_SCHEMA_PATH,
              }
            )
            handler.stores[wallet.store.alias] = await wallet.export()
            handler.notify()

            if (navigator?.success) {
              navigator.success({
                alias: data.creation.login
              })
            }
          } catch (e) {
            loading?.error()
            console.error(e)
          } finally {
            loading?.finish()
          }
        },

        load: Object.entries(handler.stores).length > 0
          ? () => navigator?.menu && navigator?.menu(STORE_CREATION_MENU_IMPORT)
          : undefined
      }

      return <Renderer {..._props} />
    }, { namespace: 'regov-wallet-store' })

export const storeCreationValidationRules: RegovValidationRules = {
  'creation.name': generalNameVlidation(),
  'creation.login': loginAliasValidation,
  'creation.password.input': passwordValidation
}

export type StoreCreationProps = RegovComponentProps<StoreCreationParams, StoreCreationImplParams>

export type StoreCreationParams = {
  defaultAlias: string
} & EmptyProps

export type StoreCreationFields = {
  creation: {
    name: string
    login: string
    password: {
      input: string
      confirm: string
    }
  }
}

export type StoreCreationImplParams = {
  create: (
    methods: UseFormReturn<StoreCreationFields>,
    crypto: CryptoHelper
  ) => (data: StoreCreationFields) => Promise<void>
  load?: () => void
}

export type StoreCreationImplProps = WrappedComponentProps<StoreCreationImplParams>

export type StoreCreationNavSuccess = {
  alias: string
}

export type StoreCreationNavigator = BasicNavigator & {
  success: WalletNavigatorMethod<StoreCreationNavSuccess>
  menu: WalletNavigatorMenuMethod<typeof STORE_CREATION_MENU_IMPORT>
}

export const STORE_CREATION_MENU_IMPORT = 'import'