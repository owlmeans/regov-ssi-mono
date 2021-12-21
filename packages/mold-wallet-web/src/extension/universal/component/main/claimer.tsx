import React from 'react'

import {
  useForm,
  UseFormProps,
  FormProvider
} from 'react-hook-form'
import {
  CredentialClaimer,
  CredentialClaimerFields,
  CredentialClaimerImplProps,
  EmptyProps,
} from '@owlmeans/regov-lib-react'

import {
  LongTextInput,
  PrimaryForm,
  FormMainAction,
  LongOutput,
  AlertOutput
} from '../../../../component'


export const MainClaimer = ({ ns }: EmptyProps) => <CredentialClaimer ns={ns} com={
  (props: CredentialClaimerImplProps) => {
    const methods = useForm<CredentialClaimerFields>(
      props.form as UseFormProps<CredentialClaimerFields>
    )

    const output = methods.watch("output")

    return <FormProvider {...methods}>
      <PrimaryForm {...props} title="claimer.title">
        <LongTextInput {...props} field="claimer.unsigned" />

        <AlertOutput {...props} field="claimer.alert" />

        <FormMainAction {...props} title="claimer.sign" action={
          methods.handleSubmit(props.sign(methods))
        } />

        {output ? <LongOutput {...props} field="output" /> : undefined}
      </PrimaryForm>
    </FormProvider>
  }
} />
