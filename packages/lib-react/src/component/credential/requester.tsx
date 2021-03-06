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

import { SSICore } from '@owlmeans/regov-ssi-core'
import React, { FunctionComponent } from 'react'
import { UseFormReturn } from 'react-hook-form'
import {
  BasicNavigator, RegovComponentProps, RegovValidationRules, withRegov, WrappedComponentProps
} from '../../common/'
import { validateJson } from '../../util'


export const CredentialRequester: FunctionComponent<CredentialRequesterParams> =
  withRegov<CredentialRequesterProps, BasicNavigator>({
    namespace: 'regov-wallet-credential',
    transformer: (wallet, _) => {
      return { ssi: wallet?.ssi }
    }
  }, ({
    t, i18n, ssi, navigator,
    com: ComRenderer,
    renderer: FallbackRenderer
  }) => {
    const Renderer: FunctionComponent<CredentialRequesterImplProps> = ComRenderer || FallbackRenderer

    const _props: CredentialRequesterImplProps = {
      t, i18n,

      rules: credentialRequesterValidatorRules,

      form: {
        mode: 'onChange',
        criteriaMode: 'all',
        defaultValues: {
          requester: {
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
            methods.setError('requester.alert', { type: 'authenticated' })
            return
          }
          

          methods.setValue('output', JSON.stringify(data, undefined, 2))
        } catch (e) {
          loading?.error()
          console.error(e)
        } finally {
          loading?.finish()
        }
      }
    }

    return <Renderer {..._props} />
  })

export const credentialRequesterValidatorRules: RegovValidationRules = {
  'requester.unsigned': {
    required: true,
    validate: {
      json: validateJson
    }
  }
}

export type CredentialRequesterParams = {
  ns?: string,
  com?: FunctionComponent
}

export type CredentialRequesterFields = {
  requester: {
    unsigned: string
    alert: string | undefined
  },
  output: string | undefined
}

export type CredentialRequesterProps = RegovComponentProps<
  CredentialRequesterParams, CredentialRequesterImplParams, CredentialRequesterState
>

export type CredentialRequesterState = {
  ssi?: SSICore
}

export type CredentialRequesterImplParams = {
  sign: (
    methods: UseFormReturn<CredentialRequesterFields>
  ) => (data: CredentialRequesterFields) => Promise<void>
}

export type CredentialRequesterImplProps = WrappedComponentProps<CredentialRequesterImplParams>