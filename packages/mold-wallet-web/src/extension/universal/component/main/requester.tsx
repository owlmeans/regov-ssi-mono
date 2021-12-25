import React from 'react'

import {
  useForm,
  UseFormProps,
  FormProvider
} from 'react-hook-form'
import {
  CredentialRequester,
  CredentialRequesterFields,
  CredentialRequesterImplProps,
} from '@owlmeans/regov-lib-react'

import {
  LongTextInput,
  PrimaryForm,
  FormMainAction,
  LongOutput,
  AlertOutput
} from '../../../../component'
import { UniversalCredentialViewParams } from './types'


export const MainRequester = ({ ext }: UniversalCredentialViewParams) => <CredentialRequester
  ns={ext.localization?.ns} com={
    (props: CredentialRequesterImplProps) => {
      const methods = useForm<CredentialRequesterFields>(
        props.form as UseFormProps<CredentialRequesterFields>
      )

      const output = methods.watch("output")

      return <FormProvider {...methods}>
        <PrimaryForm {...props} title="requester.title">
          <LongTextInput {...props} field="requester.unsigned" />

          <AlertOutput {...props} field="requester.alert" />

          <FormMainAction {...props} title="requester.sign" action={
            methods.handleSubmit(props.sign(methods))
          } />

          {output ? <LongOutput {...props} field="output" /> : undefined}
        </PrimaryForm>
      </FormProvider>
    }
  } />
