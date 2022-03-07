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
import { CredentialProposer, CredentialProposerFields, CredentialProposerImplProps } from '../../../../../common'
import { LongTextInput, PrimaryForm, FormMainAction, LongOutput, AlertOutput } from '../../../../component'
import { UniversalCredentialViewParams } from './types'


export const MainProposer = ({ ext }: UniversalCredentialViewParams) => <CredentialProposer
  ns={ext.localization?.ns} offerType={ext.schema.details.types?.offer} 
    claimType={ext.schema.details.types?.claim} com={
    (props: CredentialProposerImplProps) => {
      const methods = useForm<CredentialProposerFields>(
        props.form as UseFormProps<CredentialProposerFields>
      )

      const output = methods.watch("output")

      return <FormProvider {...methods}>
        <PrimaryForm {...props} title="proposer.title">
          <LongTextInput {...props} field="proposer.claim" maxRows sourceCode showImport alert="proposer.alert"/>
          <LongTextInput {...props} field="proposer.issuer" maxRows sourceCode showImport alert="proposer.alert"/>

          <AlertOutput {...props} field="proposer.alert" />

          <FormMainAction {...props} title="proposer.offer" action={
            methods.handleSubmit(props.offer(methods))
          } />

          {output ? <LongOutput {...props} field="output" file="universal-offer.json" /> : undefined}
        </PrimaryForm>
      </FormProvider>
    }
  } />
