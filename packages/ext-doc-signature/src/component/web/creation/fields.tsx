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
  AlertOutput, CredentialSelector, CredentialSelectorProps, dateFormatter, LongTextInput, MainTextInput, MainTextInputProps, MainTextOutput
} from "@owlmeans/regov-lib-react"
import React, { Fragment, PropsWithChildren } from "react"
import { FieldValues, UseFormReturn } from "react-hook-form"
import { typeFormatterFacotry } from "../../formatter"


export const SignatureCreationFieldsWeb = (props: SignatureCreationFieldsWebProps) => {
  const { fieldProps: _props, methods, selectorProps, children } = props
  const signatureField = props.signatureField || 'signature.creation.identity'
  const filename = methods.getValues('signature.creation.filename')
  const hash = methods.getValues('signature.creation.documentHash')

  return <Fragment>
    <MainTextInput {..._props} field="signature.creation.name" />
    <LongTextInput {..._props} field="signature.creation.description" />
    <MainTextInput {..._props} field="signature.creation.url" />
    <MainTextInput {..._props} field="signature.creation.version" />
    <MainTextInput {..._props} field="signature.creation.author" />
    <MainTextInput {..._props} field="signature.creation.authorId" />
    {
      hash && hash !== ''
      && <MainTextOutput {..._props} field="signature.creation.documentHash" showHint />
    }
    {
      hash && hash !== ''
      && < MainTextOutput {..._props} field="signature.creation.docType" showHint formatter={
        typeFormatterFacotry(_props.t)
      } />
    }
    {
      filename && filename !== ''
      && <MainTextOutput {..._props} field="signature.creation.filename" showHint />
    }
    <MainTextOutput {..._props} field="signature.creation.creationDate" showHint formatter={dateFormatter} />

    {children}

    <AlertOutput {..._props} field="signature.creation.alert" />

    <CredentialSelector {...selectorProps} field={signatureField} />
  </Fragment>
}

export type SignatureCreationFieldsWebProps = PropsWithChildren<{
  fieldProps: Omit<SignatureCreationFieldProps, "field">
  selectorProps: Omit<CredentialSelectorProps, "field">
  methods: UseFormReturn<FieldValues>
  signatureField?: string
}>

export type SignatureCreationFieldProps = MainTextInputProps