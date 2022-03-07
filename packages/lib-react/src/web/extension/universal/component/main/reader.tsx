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
import { CredentialReader, CredentialReaderFields, CredentialReaderImplProps } from '../../../../../common'
import { LongTextInput, PrimaryForm, FormMainAction, LongOutput, AlertOutput, CheckGroup } from '../../../../component'
import { UniversalCredentialViewParams } from './types'


export const MainReader = ({ ext }: UniversalCredentialViewParams) => <CredentialReader
  ns={ext.localization?.ns} com={
    (props: CredentialReaderImplProps) => {
      const methods = useForm<CredentialReaderFields>(
        props.form as UseFormProps<CredentialReaderFields>
      )

      const output = methods.watch("output")

      return <FormProvider {...methods}>
        <PrimaryForm {...props} title="reader.title">
          <CheckGroup {...props} fields={["reader.verifyIdentityStrictly"]} />
          <LongTextInput {...props} field="reader.vo" maxRows sourceCode showImport alert="reader.alert" />

          <AlertOutput {...props} field="reader.alert" />

          <FormMainAction {...props} title="reader.validate" action={
            methods.handleSubmit(props.validate(methods))
          } />

          {output ? <LongOutput {...props} field="output" /> : undefined}
        </PrimaryForm>
      </FormProvider>
    }
  } />
