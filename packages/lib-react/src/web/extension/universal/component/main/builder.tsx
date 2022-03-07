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
import {
  CredentialBuilder, CredentialBuilderFields, CredentialBuilderImplProps
} from '../../../../../common'
import {
  MainTextInput, LongTextInput, PrimaryForm, FormMainAction, LongOutput, AlertOutput
} from '../../../../component'
import { UniversalCredentialViewParams } from './types'
import { UNIVERSAL_EXTENSION_CRED_TYPE } from '@owlmeans/regov-ssi-core'


export const MainBuilder = ({ ext }: UniversalCredentialViewParams) => <CredentialBuilder
  ns={ext.localization?.ns} ext={ext} defaultType={UNIVERSAL_EXTENSION_CRED_TYPE} com={
    (props: CredentialBuilderImplProps) => {
      const methods = useForm<CredentialBuilderFields>(
        props.form as UseFormProps<CredentialBuilderFields>
      )

      const output = methods.watch("output")

      return <FormProvider {...methods}>
        <PrimaryForm {...props} title="builder.title">
          <MainTextInput {...props} field="name" />
          {/**
           * @TODO Propose types in drop down
           */}
          <MainTextInput {...props} field="builder.type" />
          {/**
           * @TODO Use https://www.npmjs.com/package/jsoneditor instead:
           */}
          <LongTextInput {...props} field="builder.context" showImport maxRows sourceCode alert="builder.alert" />
          <LongTextInput {...props} field="builder.subject" showImport maxRows sourceCode alert="builder.alert" />
          <LongTextInput {...props} field="builder.evidence" showImport maxRows sourceCode alert="builder.alert" />
          <LongTextInput {...props} field="builder.schema" showImport maxRows sourceCode alert="builder.alert" />

          <AlertOutput {...props} field="builder.alert" />

          <FormMainAction {...props} title="builder.build" action={
            methods.handleSubmit(props.build(methods))
          } />

          {output ? <LongOutput {...props} field="output" file="universal-uvc.json"
            actions={[
              { title: 'output.save', 'action': props.save(methods) }
            ]} /> : undefined}
        </PrimaryForm>
      </FormProvider>
    }
  } />
