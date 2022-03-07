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

import React from 'react'
import { useForm, UseFormProps, FormProvider } from 'react-hook-form'
import { CredentialSigner, CredentialSignerFields, CredentialSignerImplProps, } from '../../../../../common'
import { LongTextInput, PrimaryForm, FormMainAction, LongOutput, AlertOutput } from '../../../../component'
import { UniversalCredentialViewParams } from './types'
import { UNIVERSAL_EXTENSION_CRED_TYPE } from '@owlmeans/regov-ssi-core'


export const MainSigner = ({ ext }: UniversalCredentialViewParams) => <CredentialSigner
  ns={ext.localization?.ns} ext={ext} defaultType={UNIVERSAL_EXTENSION_CRED_TYPE} com={
    (props: CredentialSignerImplProps) => {
      const methods = useForm<CredentialSignerFields>(
        props.form as UseFormProps<CredentialSignerFields>
      )

      const output = methods.watch("output")

      return <FormProvider {...methods}>
        <PrimaryForm {...props} title="signer.title">
          <LongTextInput {...props} field="signer.unsigned" showImport sourceCode maxRows alert="signer.alert" />
          <LongTextInput {...props} field="signer.evidence" showImport sourceCode maxRows alert="signer.alert" />

          <AlertOutput {...props} field="signer.alert" />

          <FormMainAction {...props} title="signer.sign" action={
            methods.handleSubmit(props.sign(methods))
          } />

          {output ? <LongOutput {...props} field="output" file="universal-vc.json" /> : undefined}
        </PrimaryForm>
      </FormProvider>
    }
  } />
