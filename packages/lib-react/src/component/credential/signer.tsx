import {
  SSICore,
  UnsignedCredential,
} from '@owlmeans/regov-ssi-core'
import { Extension } from '@owlmeans/regov-ssi-extension'
import React, {
  FunctionComponent
} from 'react'
import { UseFormReturn } from 'react-hook-form'
import {
  BasicNavigator,
  RegovCompoentProps,
  RegovValidationRules,
  useRegov,
  withRegov,
  WrappedComponentProps
} from '../../common'
import { validateJson } from '../../util'


export const CredentialSigner: FunctionComponent<CredentialSignerParams> =
  withRegov<CredentialSignerProps, BasicNavigator>({
    namespace: 'regov-wallet-credential',
    transformer: (wallet, _) => {
      return { ssi: wallet?.ssi }
    }
  }, ({
    t, i18n, ssi, navigator, ext, defaultType,
    com: ComRenderer,
    renderer: FallbackRenderer
  }) => {
    const { handler } = useRegov()
    const Renderer = ComRenderer || FallbackRenderer

    const _props: CredentialSignerImplProps = {
      t, i18n,

      rules: credentialSignerValidatorRules,

      form: {
        mode: 'onChange',
        criteriaMode: 'all',
        defaultValues: {
          signer: {
            unsigned: '{}',
            evidence: '',
            alert: undefined,
          },
          outout: undefined
        }
      },

      sign: methods => async data => {
        const loading = await navigator?.invokeLoading()
        try {
          if (!ssi || !handler.wallet) {
            methods.setError('signer.alert', { type: 'authenticated' })
            return
          }

          const unsigned = JSON.parse(data.signer.unsigned) as UnsignedCredential
          const factory = ext.getFactory(unsigned.type, defaultType)
          try {
            const cred = await factory.signingFactory(handler.wallet, { unsigned })
            methods.setValue('output', JSON.stringify(cred, undefined, 2))
          } catch (error) {
            console.log(error)
            if (error.message) {
              methods.setError('signer.alert', { type: error.message })
              return
            }
            throw error
          }
        } catch (error) {
          loading?.error(error)
          console.log(error)
        } finally {
          loading?.finish()
        }
      }
    }

    return <Renderer {..._props} />
  })

export const credentialSignerValidatorRules: RegovValidationRules = {
  'signer.unsigned': {
    required: true,
    validate: {
      json: validateJson
    }
  },
  'signer.evidence': {
    validate: {
      json: (v: string) => v === '' || validateJson(v)
    }
  }
}

export type CredentialSignerParams = {
  ns?: string
  com?: FunctionComponent
  ext: Extension<string>
  defaultType: string
}

export type CredentialSignerFields = {
  signer: {
    unsigned: string
    evidence: string
    alert: string | undefined
  },
  output: string | undefined
}

export type CredentialSignerProps = RegovCompoentProps<
  CredentialSignerParams, CredentialSignerImplParams, CredentialSignerState
>

export type CredentialSignerState = {
  ssi?: SSICore
}

export type CredentialSignerImplParams = {
  sign: (
    methods: UseFormReturn<CredentialSignerFields>
  ) => (data: CredentialSignerFields) => Promise<void>
}

export type CredentialSignerImplProps = WrappedComponentProps<CredentialSignerImplParams>