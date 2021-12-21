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


export const CredentialClaimer: FunctionComponent<CredentialClaimerParams> =
  withRegov<CredentialClaimerProps, BasicNavigator>({
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

    const _props: CredentialClaimerImplProps = {
      t, i18n,

      rules: credentialClaimerValidatorRules,

      form: {
        mode: 'onChange',
        criteriaMode: 'all',
        defaultValues: {
          claimer: {
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
            methods.setError('claimer.alert', { type: 'authenticated' })
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

export const credentialClaimerValidatorRules: RegovValidationRules = {
  'claimer.unsigned': {
    required: true,
    validate: {
      json: validateJson
    }
  }
}

export type CredentialClaimerParams = {
  ns?: string,
  com?: FunctionComponent
}

export type CredentialClaimerFields = {
  claimer: {
    unsigned: string
    alert: string | undefined
  },
  output: string | undefined
}

export type CredentialClaimerProps = RegovCompoentProps<
  CredentialClaimerParams, CredentialClaimerImplParams, CredentialClaimerState
>

export type CredentialClaimerState = {
  ssi?: SSICore
}

export type CredentialClaimerImplParams = {
  sign: (
    methods: UseFormReturn<CredentialClaimerFields>
  ) => (data: CredentialClaimerFields) => Promise<void>
}

export type CredentialClaimerImplProps = WrappedComponentProps<CredentialClaimerImplParams>