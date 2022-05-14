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

import { SSICore, UnsignedCredential } from '@owlmeans/regov-ssi-core'
import { Extension } from '@owlmeans/regov-ssi-core'
import React, { FunctionComponent } from 'react'
import { UseFormReturn } from 'react-hook-form'
import {
  BasicNavigator, RegovComponentProps, RegovValidationRules, useRegov, withRegov, WrappedComponentProps
} from '../../common/'
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
    const Renderer: FunctionComponent<CredentialSignerImplProps> = ComRenderer || FallbackRenderer

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
            const cred = await factory.sign(handler.wallet, { unsigned })
            methods.setValue('output', JSON.stringify(cred, undefined, 2))
          } catch (error) {
            console.error(error)
            if (error.message) {
              methods.setError('signer.alert', { type: error.message })
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
  ext: Extension
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

export type CredentialSignerProps = RegovComponentProps<
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