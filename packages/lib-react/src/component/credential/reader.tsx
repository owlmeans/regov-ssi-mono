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
            vc: '{}',
            alert: undefined,
          },
          outout: undefined
        }
      },

      validate: methods => async data => {
        const loading = await navigator?.invokeLoading()
        try {
          if (!ssi) {
            methods.setError('reader.alert', { type: 'authenticated' })
            return
          }

          const vc = JSON.parse(data.reader.vc)
          /**
           * @TODO Switch between VC and VP presentation validation, based 
           * on the type in JSON
           */
          const [, info] = await ssi.verifyCredential(vc)

          if (info.kind === 'invalid') {
            methods.setValue('output', undefined)
            loading?.error({ name: 'vc.verification', message: info.errors[0].message })
            return
          }
          /**
           * @TODO Add additional validation to check that one trusts the issuer.
           * Use output as special set of data that describes validated credential
           */

          methods.setValue('output', JSON.stringify(info, undefined, 2))
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
  'reader.vc': {
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
    vc: string
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
  validate: (
    methods: UseFormReturn<CredentialReaderFields>
  ) => (data: CredentialReaderFields) => Promise<void>
}

export type CredentialReaderImplProps = WrappedComponentProps<CredentialReaderImplParams>