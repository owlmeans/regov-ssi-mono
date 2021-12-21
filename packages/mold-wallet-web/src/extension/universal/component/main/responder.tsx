import React from 'react'

import {
  useForm,
  UseFormProps,
  FormProvider
} from 'react-hook-form'
import {
  CredentialResponder,
  CredentialResponderFields,
  CredentialResponderImplProps,
  EmptyProps,
} from '@owlmeans/regov-lib-react'

import {
  LongTextInput,
  PrimaryForm,
  FormMainAction,
  LongOutput,
  AlertOutput
} from '../../../../component'


export const MainResponder = ({ ns }: EmptyProps) => <CredentialResponder ns={ns} com={
  (props: CredentialResponderImplProps) => {
    const methods = useForm<CredentialResponderFields>(
      props.form as UseFormProps<CredentialResponderFields>
    )

    const output = methods.watch("output")

    return <FormProvider {...methods}>
      <PrimaryForm {...props} title="responder.title">
        <LongTextInput {...props} field="responder.unsigned" />

        <AlertOutput {...props} field="responder.alert" />

        <FormMainAction {...props} title="responder.sign" action={
          methods.handleSubmit(props.sign(methods))
        } />

        {output ? <LongOutput {...props} field="output" /> : undefined}
      </PrimaryForm>
    </FormProvider>
  }
} />
