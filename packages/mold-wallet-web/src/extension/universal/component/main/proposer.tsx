import React from 'react'

import {
  useForm,
  UseFormProps,
  FormProvider
} from 'react-hook-form'
import {
  CredentialProposer,
  CredentialProposerFields,
  CredentialProposerImplProps,
  EmptyProps,
} from '@owlmeans/regov-lib-react'

import {
  LongTextInput,
  PrimaryForm,
  FormMainAction,
  LongOutput,
  AlertOutput
} from '../../../../component'


export const MainProposer = ({ ns }: EmptyProps) => <CredentialProposer ns={ns} com={
  (props: CredentialProposerImplProps) => {
    const methods = useForm<CredentialProposerFields>(
      props.form as UseFormProps<CredentialProposerFields>
    )

    const output = methods.watch("output")

    return <FormProvider {...methods}>
      <PrimaryForm {...props} title="proposer.title">
        <LongTextInput {...props} field="proposer.unsigned" />

        <AlertOutput {...props} field="proposer.alert" />

        <FormMainAction {...props} title="proposer.sign" action={
          methods.handleSubmit(props.sign(methods))
        } />

        {output ? <LongOutput {...props} field="output" /> : undefined}
      </PrimaryForm>
    </FormProvider>
  }
} />
