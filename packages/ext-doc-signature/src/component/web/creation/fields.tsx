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