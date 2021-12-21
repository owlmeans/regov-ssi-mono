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


export const CredentialProposer: FunctionComponent<CredentialProposerParams> =
  withRegov<CredentialProposerProps, BasicNavigator>({
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

    const _props: CredentialProposerImplProps = {
      t, i18n,

      rules: credentialProposerValidatorRules,

      form: {
        mode: 'onChange',
        criteriaMode: 'all',
        defaultValues: {
          proposer: {
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
            methods.setError('proposer.alert', { type: 'authenticated' })
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

export const credentialProposerValidatorRules: RegovValidationRules = {
  'proposer.unsigned': {
    required: true,
    validate: {
      json: validateJson
    }
  }
}

export type CredentialProposerParams = {
  ns?: string,
  com?: FunctionComponent
}

export type CredentialProposerFields = {
  proposer: {
    unsigned: string
    alert: string | undefined
  },
  output: string | undefined
}

export type CredentialProposerProps = RegovCompoentProps<
  CredentialProposerParams, CredentialProposerImplParams, CredentialProposerState
>

export type CredentialProposerState = {
  ssi?: SSICore
}

export type CredentialProposerImplParams = {
  sign: (
    methods: UseFormReturn<CredentialProposerFields>
  ) => (data: CredentialProposerFields) => Promise<void>
}

export type CredentialProposerImplProps = WrappedComponentProps<CredentialProposerImplParams>