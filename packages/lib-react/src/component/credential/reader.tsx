import {
  SSICore
} from '@owlmeans/regov-ssi-core'
import React, {
  FunctionComponent
} from 'react'
import { UseFormReturn } from 'react-hook-form'
import {
  BasicNavigator,
  RegovCompoentProps,
  RegovValidationRules,
  withRegov,
  WrappedComponentProps
} from '../../common'
import { validateJson } from '../../util'


export const CredentialReader: FunctionComponent<CredentialReaderParams> =
  withRegov<CredentialReaderProps, BasicNavigator>({
    namespace: 'regov-wallet-credential',
    transformer: (wallet, _) => {
      return { ssi: wallet?.ssi }
    }
  }, ({
    t, i18n, ssi, navigator,
    com: ComRenderer,
    renderer: FallbackRenderer
  }) => {
    const Renderer = ComRenderer || FallbackRenderer

    const _props: CredentialReaderImplProps = {
      t, i18n,

      rules: credentialReaderValidatorRules,

      form: {
        mode: 'onChange',
        criteriaMode: 'all',
        defaultValues: {
          reader: {
            unsigned: '{}',
            alert: undefined,
          },
          outout: undefined
        }
      },

      sign: methods => async data => {
        const loading = await navigator?.invokeLoading()
        try {
          if (!ssi) {
            methods.setError('reader.alert', { type: 'authenticated' })
            return
          }
          

          methods.setValue('output', JSON.stringify(data, undefined, 2))
        } catch (e) {
          loading?.error()
          console.log(e)
        } finally {
          loading?.finish()
        }
      }
    }

    return <Renderer {..._props} />
  })

export const credentialReaderValidatorRules: RegovValidationRules = {
  'reader.unsigned': {
    required: true,
    validate: {
      json: validateJson
    }
  }
}

export type CredentialReaderParams = {
  ns?: string,
  com?: FunctionComponent
}

export type CredentialReaderFields = {
  reader: {
    unsigned: string
    alert: string | undefined
  },
  output: string | undefined
}

export type CredentialReaderProps = RegovCompoentProps<
  CredentialReaderParams, CredentialReaderImplParams, CredentialReaderState
>

export type CredentialReaderState = {
  ssi?: SSICore
}

export type CredentialReaderImplParams = {
  sign: (
    methods: UseFormReturn<CredentialReaderFields>
  ) => (data: CredentialReaderFields) => Promise<void>
}

export type CredentialReaderImplProps = WrappedComponentProps<CredentialReaderImplParams>