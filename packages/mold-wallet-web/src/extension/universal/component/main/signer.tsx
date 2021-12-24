import React from 'react'

import {
  useForm,
  UseFormProps,
  FormProvider
} from 'react-hook-form'
import {
  CredentialSigner,
  CredentialSignerFields,
  CredentialSignerImplProps,
  EmptyProps,
} from '@owlmeans/regov-lib-react'

import {
  LongTextInput,
  PrimaryForm,
  FormMainAction,
  LongOutput,
  AlertOutput
} from '../../../../component'


export const MainSigner = ({ ns }: EmptyProps) => <CredentialSigner ns={ns} com={
  (props: CredentialSignerImplProps) => {
    const methods = useForm<CredentialSignerFields>(
      props.form as UseFormProps<CredentialSignerFields>
    )

    const output = methods.watch("output")

    return <FormProvider {...methods}>
      <PrimaryForm {...props} title="signer.title">
        <LongTextInput {...props} field="signer.unsigned" showImport maxRows alert="signer.alert"/>
        <LongTextInput {...props} field="signer.evidence" showImport maxRows alert="signer.alert"/>

        <AlertOutput {...props} field="signer.alert" />

        <FormMainAction {...props} title="signer.sign" action={
          methods.handleSubmit(props.sign(methods))
        } />

        {output ? <LongOutput {...props} field="output" file="universal-vc.json" /> : undefined}
      </PrimaryForm>
    </FormProvider>
  }
} />
