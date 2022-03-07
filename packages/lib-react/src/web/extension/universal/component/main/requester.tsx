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
import { CredentialRequester, CredentialRequesterFields, CredentialRequesterImplProps } from '../../../../../common'
import { LongTextInput, PrimaryForm, FormMainAction, LongOutput, AlertOutput } from '../../../../component'
import { UniversalCredentialViewParams } from './types'


export const MainRequester = ({ ext }: UniversalCredentialViewParams) => <CredentialRequester
  ns={ext.localization?.ns} com={
    (props: CredentialRequesterImplProps) => {
      const methods = useForm<CredentialRequesterFields>(
        props.form as UseFormProps<CredentialRequesterFields>
      )

      const output = methods.watch("output")

      return <FormProvider {...methods}>
        <PrimaryForm {...props} title="requester.title">
          <LongTextInput {...props} sourceCode field="requester.unsigned" />

          <AlertOutput {...props} field="requester.alert" />

          <FormMainAction {...props} title="requester.sign" action={
            methods.handleSubmit(props.sign(methods))
          } />

          {output ? <LongOutput {...props} field="output" /> : undefined}
        </PrimaryForm>
      </FormProvider>
    }
  } />
