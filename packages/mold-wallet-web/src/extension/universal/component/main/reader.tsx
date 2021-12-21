import React from 'react'

import {
  useForm,
  UseFormProps,
  FormProvider
} from 'react-hook-form'
import {
  CredentialReader,
  CredentialReaderFields,
  CredentialReaderImplProps,
  EmptyProps,
} from '@owlmeans/regov-lib-react'

import {
  LongTextInput,
  PrimaryForm,
  FormMainAction,
  LongOutput,
  AlertOutput
} from '../../../../component'


export const MainReader = ({ ns }: EmptyProps) => <CredentialReader ns={ns} com={
  (props: CredentialReaderImplProps) => {
    const methods = useForm<CredentialReaderFields>(
      props.form as UseFormProps<CredentialReaderFields>
    )

    const output = methods.watch("output")

    return <FormProvider {...methods}>
      <PrimaryForm {...props} title="reader.title">
        <LongTextInput {...props} field="reader.unsigned" />

        <AlertOutput {...props} field="reader.alert" />

        <FormMainAction {...props} title="reader.sign" action={
          methods.handleSubmit(props.sign(methods))
        } />

        {output ? <LongOutput {...props} field="output" /> : undefined}
      </PrimaryForm>
    </FormProvider>
  }
} />
