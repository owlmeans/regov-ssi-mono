import {
  BASE_CREDENTIAL_TYPE,
  CredentialType,
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
import { Extension } from '@owlmeans/regov-ssi-extension'


export const CredentialBuilder: FunctionComponent<CredentialBuilderParams> =
  withRegov<CredentialBuilderProps, BasicNavigator>({
    namespace: 'regov-wallet-credential',
    transformer: (wallet, _) => { return { ssi: wallet?.ssi, wallet } }
  }, ({
    t, i18n, ssi, wallet, navigator, ext, defaultType,
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
            schema: '',
            alert: undefined,
          },
          outout: undefined
        }
      },

      build: methods => async data => {
        const loading = await navigator?.invokeLoading()
        try {
          if (!ssi || !wallet) {
            methods.setError('builder.alert', { type: 'authenticated' })
            return
          }

          const types = JSON.parse(data.builder.type) as CredentialType
          const factory = ext.factories[
            Object.entries(ext.factories).map(([type]) => type)
              .find(type => types.includes(type)) || defaultType
          ]
          const unsigned = await factory.buildingFactory(wallet, {
            type: types,
            subjectData: JSON.parse(data.builder.subject),
            context: JSON.parse(data.builder.context),
            evidence: data.builder.evidence === '' ? undefined : JSON.parse(data.builder.evidence),
            credentialSchema: data.builder.schema === '' ? undefined : JSON.parse(data.builder.schema),
          })

          methods.setValue('output', JSON.stringify(unsigned, undefined, 2))
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
  },
  'builder.schema': {
    validate: {
      json: (v: string) => v === '' || validateJson(v)
    }
  }
}

export type CredentialBuilderParams = {
  ns?: string,
  com?: FunctionComponent,
  ext: Extension<string>
  defaultType: string
}

export type CredentialBuilderFields = {
  builder: {
    context: string
    type: string
    subject: string
    evidence: string
    schema: string
    alert: string | undefined
  },
  output: string | undefined
}

export type CredentialBuilderProps = RegovCompoentProps<
  CredentialBuilderParams, CredentialBuilderImplParams, CredentialBuilderState
>

export type CredentialBuilderState = {
  ssi?: SSICore,
  wallet?: WalletWrapper
}

export type CredentialBuilderImplParams = {
  build: (methods: UseFormReturn<CredentialBuilderFields>) =>
    (data: CredentialBuilderFields) => Promise<void>
}

export type CredentialBuilderImplProps = WrappedComponentProps<CredentialBuilderImplParams>