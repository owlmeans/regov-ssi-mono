import { SSICore, UnsignedCredential } from '@owlmeans/regov-ssi-core'
import { Extension } from '@owlmeans/regov-ssi-core'
import React, { FunctionComponent } from 'react'
import { UseFormReturn } from 'react-hook-form'
import {
  BasicNavigator, RegovComponentProps, RegovValidationRules, useRegov, withRegov, WrappedComponentProps
} from '../../common/'
import { validateJson } from '../../util'


export const CredentialClaimer: FunctionComponent<CredentialClaimerParams> =
  withRegov<CredentialClaimerProps, BasicNavigator>({
    namespace: 'regov-wallet-credential',
    transformer: (wallet, _) => {
      return { ssi: wallet?.ssi }
    }
  }, ({
    t, i18n, ssi, navigator, ext,
    claimType, defaultType,
    com: ComRenderer,
    renderer: FallbackRenderer
  }) => {
    const { handler } = useRegov()
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
            holder: '',
            alert: undefined,
          },
          outout: undefined
        }
      },

      claim: methods => async data => {
        const loading = await navigator?.invokeLoading()
        try {
          if (!ssi || !handler.wallet) {
            methods.setError('claimer.alert', { type: 'authenticated' })
            return
          }

          const unsignedClaim = JSON.parse(data.claimer.unsigned) as UnsignedCredential
          const factory = ext.getFactory(unsignedClaim.type, defaultType)

          try {
            const claim = await factory.claim(handler.wallet, { unsignedClaim, claimType })
            methods.setValue('output', JSON.stringify(claim, undefined, 2))
          } catch (error) {
            console.error(error)
            if (error.message) {
              methods.setError('claimer.alert', { type: error.message })
              return
            }
            throw error
          }
        } catch (error) {
          loading?.error(error)
          console.error(error)
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
  },
  'claimer.holder': {
    validate: {
      json: (v: string) => v === '' || validateJson(v)
    }
  }
}

export type CredentialClaimerParams = {
  ns?: string
  claimType?: string
  com?: FunctionComponent
  ext: Extension
  defaultType: string
}

export type CredentialClaimerFields = {
  claimer: {
    unsigned: string
    holder: string
    alert: string | undefined
  },
  output: string | undefined
}

export type CredentialClaimerProps = RegovComponentProps<
  CredentialClaimerParams, CredentialClaimerImplParams, CredentialClaimerState
>

export type CredentialClaimerState = {
  ssi?: SSICore
}

export type CredentialClaimerImplParams = {
  claim: (
    methods: UseFormReturn<CredentialClaimerFields>
  ) => (data: CredentialClaimerFields) => Promise<void>
}

export type CredentialClaimerImplProps = WrappedComponentProps<CredentialClaimerImplParams>