import { normalizeValue } from '@owlmeans/regov-ssi-common'
import {
  BASE_CREDENTIAL_TYPE,
  BASE_PRESENTATION_TYPE,
  buildWalletLoader,
  isCredential,
  isPresentation,
  SSICore,
  WalletWrapper
} from '@owlmeans/regov-ssi-core'
import { VERIFICATION_KEY_HOLDER } from '@owlmeans/regov-ssi-did'
import React, {
  FunctionComponent
} from 'react'
import { UseFormReturn } from 'react-hook-form'
import {
  BasicNavigator,
  RegovComponetProps,
  RegovValidationRules,
  withRegov,
  WrappedComponentProps
} from '../../common'
import { validateJson } from '../../util'
import { VerificationResult } from './types'


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
            verifyIdentityStrictly: true,
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

          let result: VerificationResult = { type: 'unknown' }
          const vo = JSON.parse(data.reader.vo)
          if (isPresentation(vo)) {
            const [isPresValid, presValidation] = await ssi.verifyPresentation(vo, undefined, {
              testEvidence: true,
              nonStrictEvidence: !data.reader.verifyIdentityStrictly,
              localLoader: wallet ? buildWalletLoader(wallet) : undefined
            })

            if (!isPresValid) {
              if (presValidation.kind === 'invalid') {
                methods.setValue('output', JSON.stringify(presValidation, undefined, 2))
                methods.setError('reader.alert', {
                  type: 'reader.vo.presentation',
                  message: presValidation.errors[0].message
                })
                return
              }
            }

            result = {
              type: BASE_PRESENTATION_TYPE,
              valid: true,
              credentials: normalizeValue(vo.verifiableCredential).map(
                cred => {
                  return {
                    valid: true,
                    type: BASE_CREDENTIAL_TYPE,
                    hasEvidence: !!cred.evidence,
                    hasSchema: !!cred.credentialSchema,
                    selfSigned: ssi.did.helper().extractKeyId(cred.proof.verificationMethod)
                      === VERIFICATION_KEY_HOLDER
                  }
                }
              )
            }
          } else if (isCredential(vo)) {
            const [isCredValid, credValidation] = await ssi.verifyCredential(
              vo, undefined, {
              nonStrictEvidence: !data.reader.verifyIdentityStrictly,
              localLoader: wallet ? buildWalletLoader(wallet) : undefined,
              verifyEvidence: true,
              verifySchema: true
            })

            if (!isCredValid) {
              if (credValidation.kind === 'invalid') {
                methods.setValue('output', JSON.stringify(credValidation, undefined, 2))
                methods.setError('reader.alert', {
                  type: `reader.vo.${credValidation.errors[0].kind}`,
                  message: credValidation.errors[0].message
                })
                return
              }
            }

            result = {
              valid: true,
              type: BASE_CREDENTIAL_TYPE,
              hasEvidence: !!vo.evidence,
              hasSchema: !!vo.credentialSchema,
              selfSigned: ssi.did.helper().extractKeyId(vo.proof.verificationMethod)
                === VERIFICATION_KEY_HOLDER
            }
          } else {
            methods.setError('reader.alert', { type: 'reader.vo.format' })
          }

          methods.setValue('output', result)
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
    verifyIdentityStrictly: boolean
    vo: string
    alert: string | undefined
  },
  output: VerificationResult | string | undefined
}

export type CredentialReaderProps = RegovComponetProps<
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

