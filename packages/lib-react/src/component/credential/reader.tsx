import {
  buildWalletLoader,
  isCredential,
  isPresentation,
  SSICore,
  WalletWrapper
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
      return { ssi: wallet?.ssi, wallet }
    }
  }, ({
    t, i18n, ssi, wallet, navigator,
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
            vo: '{}',
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

          const result: { info?: any } = {}
          const vo = JSON.parse(data.reader.vo)
          if (isPresentation(vo)) {
            const [isPresValid, presValidation] = await ssi.verifyPresentation(vo, undefined, {
              testEvidence: true,
              /** 
               * @TODO Allow to regulate evidence trust
               */
              nonStrictEvidence: true,
              localLoader: wallet ? buildWalletLoader(wallet) : undefined
            })

            if (!isPresValid) {
              if (presValidation.kind === 'invalid') {
                methods.setError('reader.alert', {
                  type: 'reader.vo.presentation',
                  message: presValidation.errors[0].message
                })
                return
              }
            }

            result.info = presValidation
          } else if (isCredential(vo)) {
            const [isCredValid, credValidation] = await ssi.verifyCredential(vo)

            if (!isCredValid) {
              if (credValidation.kind === 'invalid') {
                methods.setError('reader.alert', { message: credValidation.errors[0].message })
                return
              }
            }

            if (isCredValid) {
              const [evidenceResult, evidenceErrors] = await ssi.verifyEvidence(vo, undefined, {
                /** 
                * @TODO Allow to regulate evidence trust
                */
                nonStrictEvidence: true,
                localLoader: wallet ? buildWalletLoader(wallet) : undefined
              })
              if (!evidenceResult) {
                methods.setError('reader.alert', {
                  type: 'reader.vo.credential',
                  message: evidenceErrors[0].message
                })
              }
            }

            result.info = credValidation
          } else {
            methods.setError('reader.alert', { type: 'reader.vo.format' })
            return
          }

          /**
           * @TODO Add additional validation to check that one trusts the issuer.
           * Use output as special set of data that describes validated credential
           */

          methods.setValue('output', JSON.stringify(result, undefined, 2))
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

export const credentialReaderValidatorRules: RegovValidationRules = {
  'reader.vo': {
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
    vo: string
    alert: string | undefined
  },
  output: string | undefined
}

export type CredentialReaderProps = RegovCompoentProps<
  CredentialReaderParams, CredentialReaderImplParams, CredentialReaderState
>

export type CredentialReaderState = {
  ssi?: SSICore,
  wallet?: WalletWrapper
}

export type CredentialReaderImplParams = {
  validate: (
    methods: UseFormReturn<CredentialReaderFields>
  ) => (data: CredentialReaderFields) => Promise<void>
}

export type CredentialReaderImplProps = WrappedComponentProps<CredentialReaderImplParams>