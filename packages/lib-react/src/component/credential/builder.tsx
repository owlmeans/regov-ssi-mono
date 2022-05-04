/**
 *  Copyright 2022 OwlMeans
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import {
  BASE_CREDENTIAL_TYPE, CredentialsRegistryWrapper, CredentialType, REGISTRY_SECTION_OWN,
  REGISTRY_TYPE_UNSIGNEDS, SSICore, WalletWrapper
} from '@owlmeans/regov-ssi-core'
import React, { Fragment, FunctionComponent } from 'react'
import { UseFormReturn } from 'react-hook-form'
import {
  BasicNavigator, RegovComponentProps, RegovValidationRules, useRegov, withRegov, WrappedComponentProps
} from '../../common/'
import { generalNameVlidation, validateJson } from '../../util'
import { Extension, findAppropriateCredentialType } from '@owlmeans/regov-ssi-core'


export const CredentialBuilder: FunctionComponent<CredentialBuilderParams> =
  withRegov<CredentialBuilderProps, BasicNavigator>({
    namespace: 'regov-wallet-credential',
    transformer: (wallet, _) => { return { ssi: wallet?.ssi, wallet } }
  }, ({
    t, i18n, ssi, wallet, navigator, ext, defaultType,
    com: ComRenderer,
    renderer: FallbackRenderer
  }) => {
    const { handler, extensions } = useRegov()
    const Renderer = ComRenderer || FallbackRenderer

    if (!wallet) {
      return <Fragment />
    }

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
          name: '',
          outout: undefined
        }
      },

      registry: wallet.getRegistry(REGISTRY_TYPE_UNSIGNEDS),

      build: methods => async data => {
        const loading = await navigator?.invokeLoading()
        try {
          if (!ssi || !wallet) {
            methods.setError('builder.alert', { type: 'authenticated' })
            return
          }

          const types = JSON.parse(data.builder.type) as CredentialType
          const type = findAppropriateCredentialType(ext, types, defaultType)
          const factory = ext.getFactory(type, defaultType)
          const unsigned = await factory.build(wallet, {
            type: types, extensions: extensions?.registry,
            subjectData: JSON.parse(data.builder.subject),
            context: JSON.parse(data.builder.context),
            evidence: data.builder.evidence === '' ? undefined : JSON.parse(data.builder.evidence),
            credentialSchema: data.builder.schema === '' ? undefined : JSON.parse(data.builder.schema),
          })

          methods.setValue('extType', type)
          methods.setValue('output', JSON.stringify(unsigned, undefined, 2))
        } catch (error) {
          loading?.error(error.message)
          console.error(error)
        } finally {
          loading?.finish()
        }
      },

      save: methods => async () => {
        const loading = await navigator?.invokeLoading()
        try {
          const type = methods.getValues('extType')
          const credDetails = ext.schema.credentials
            ? ext.schema.credentials[type as keyof typeof ext.schema.credentials]
            : { defaultNameKey: 'wallet.registry.cred.title' }

          const registry = wallet.getRegistry(REGISTRY_TYPE_UNSIGNEDS)
          const count = 1 + registry.registry.credentials[REGISTRY_SECTION_OWN].length
          /**
           * @TODO What if we scetch a credential for someone else
           */
          const wrap = await registry.addCredential(
            JSON.parse(methods.getValues('output') as string), REGISTRY_SECTION_OWN
          )
          const name = methods.getValues('name')
          wrap.meta.title = name !== ''
            ? name
            : `${t(credDetails.defaultNameKey || 'wallet.registry.cred.title')} - ${count}`
          handler.notify()
          loading?.success(t('builder.save.success', { name: wrap.meta.title }))
        } catch (error) {
          loading?.error(error.message)
          console.error(error)
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
  },
  'name': generalNameVlidation(false)
}

export type CredentialBuilderParams = {
  ns?: string,
  com?: FunctionComponent,
  ext: Extension
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
  name: string
  extType: string
  output: string | undefined
}

export type CredentialBuilderProps = RegovComponentProps<
  CredentialBuilderParams, CredentialBuilderImplParams, CredentialBuilderState
>

export type CredentialBuilderState = {
  ssi?: SSICore,
  wallet?: WalletWrapper
}

export type CredentialBuilderImplParams = {
  build: (methods: UseFormReturn<CredentialBuilderFields>) =>
    (data: CredentialBuilderFields) => Promise<void>
  registry: CredentialsRegistryWrapper
  save: (methods: UseFormReturn<CredentialBuilderFields>) => () => Promise<void>
}

export type CredentialBuilderImplProps = WrappedComponentProps<CredentialBuilderImplParams>