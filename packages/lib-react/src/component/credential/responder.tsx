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


export const CredentialResponder: FunctionComponent<CredentialResponderParams> =
  withRegov<CredentialResponderProps, BasicNavigator>({
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

    const _props: CredentialResponderImplProps = {
      t, i18n,

      rules: credentialResponderValidatorRules,

      form: {
        mode: 'onChange',
        criteriaMode: 'all',
        defaultValues: {
          responder: {
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
            methods.setError('responder.alert', { type: 'authenticated' })
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

export const credentialResponderValidatorRules: RegovValidationRules = {
  'responder.unsigned': {
    required: true,
    validate: {
      json: validateJson
    }
  }
}

export type CredentialResponderParams = {
  ns?: string,
  com?: FunctionComponent
}

export type CredentialResponderFields = {
  responder: {
    unsigned: string
    alert: string | undefined
  },
  output: string | undefined
}

export type CredentialResponderProps = RegovCompoentProps<
  CredentialResponderParams, CredentialResponderImplParams, CredentialResponderState
>

export type CredentialResponderState = {
  ssi?: SSICore
}

export type CredentialResponderImplParams = {
  sign: (
    methods: UseFormReturn<CredentialResponderFields>
  ) => (data: CredentialResponderFields) => Promise<void>
}

export type CredentialResponderImplProps = WrappedComponentProps<CredentialResponderImplParams>