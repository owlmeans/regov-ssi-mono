import {
  BASE_CREDENTIAL_TYPE,
  SSICore
} from '@owlmeans/regov-ssi-core'
import React, {
  FunctionComponent
} from 'react'
import { UseFormReturn } from 'react-hook-form'
import {
  DIDPURPOSE_ASSERTION,
  DIDPURPOSE_AUTHENTICATION,
  DIDPURPOSE_VERIFICATION
} from '@owlmeans/regov-ssi-did'
import {
  BasicNavigator,
  RegovCompoentProps,
  RegovValidationRules,
  withRegov,
  WrappedComponentProps
} from '../../common'
import { validateJson } from '../../util'


export const CredentialBuilder: FunctionComponent<CredentialBuilderParams> =
  withRegov<CredentialBuilderProps, BasicNavigator>({
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

    const _props: CredentialBuilderImplProps = {
      t, i18n,

      rules: credentialBuilderValidatorRules,

      form: {
        mode: 'onChange',
        criteriaMode: 'all',
        defaultValues: {
          builder: {
            context: '{}',
            type: `["${BASE_CREDENTIAL_TYPE}"]`,
            subject: '{}',
            evidence: '',
            alert: undefined,
          },
          outout: undefined
        }
      },

      build: methods => async data => {
        const loading = await navigator?.invokeLoading()
        try {
          if (!ssi) {
            methods.setError('builder.alert', { type: 'authenticated' })
            return
          }
          const key = await ssi.keys.getCryptoKey()

          const did = await ssi.did.helper().createDID(
            key,
            {
              data: data.builder.subject,
              hash: true,
              /**
               * @TODO Should be options to select
               */
              purpose: [DIDPURPOSE_VERIFICATION, DIDPURPOSE_ASSERTION, DIDPURPOSE_AUTHENTICATION]
            }
          )

          const skeleton = await ssi.buildCredential({
            id: did.id,
            type: JSON.parse(data.builder.type),
            holder: did,
            subject: JSON.parse(data.builder.subject),
            context: JSON.parse(data.builder.context)
          })
          if (data.builder.evidence !== '') {
            skeleton.evidence = JSON.parse(data.builder.evidence)
          }

          methods.setValue('output', JSON.stringify(skeleton, undefined, 2))
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



export const credentialBuilderValidatorRules: RegovValidationRules = {
  'builder.context': {
    required: true,
    validate: {
      json: validateJson
    }
  },
  'builder.type': {
    required: true,
    validate: {
      json: validateJson
    }
  },
  'builder.subject': {
    required: true,
    validate: {
      json: validateJson
    }
  },
  'builder.evidence': {
    validate: {
      json: (v: string) => v === '' || validateJson(v)
    }
  }
}

export type CredentialBuilderParams = {
  ns?: string,
  com?: FunctionComponent
}

export type CredentialBuilderFields = {
  builder: {
    context: string
    type: string
    subject: string
    evidence: string
    alert: string | undefined
  },
  output: string | undefined
}

export type CredentialBuilderProps = RegovCompoentProps<
  CredentialBuilderParams, CredentialBuilderImplParams, CredentialBuilderState
>

export type CredentialBuilderState = {
  ssi?: SSICore
}

export type CredentialBuilderImplParams = {
  build: (
    methods: UseFormReturn<CredentialBuilderFields>
  ) => (data: CredentialBuilderFields) => Promise<void>
}

export type CredentialBuilderImplProps = WrappedComponentProps<CredentialBuilderImplParams>