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
} from '@owlmeans/regov-lib-react'

import {
  LongTextInput,
  PrimaryForm,
  FormMainAction,
  LongOutput,
  AlertOutput
} from '../../../../component'
import { UniversalCredentialViewParams } from './types'


export const MainResponder = ({ ext }: UniversalCredentialViewParams) => <CredentialResponder
  ns={ext.localization?.ns} com={
    (props: CredentialResponderImplProps) => {
      const methods = useForm<CredentialResponderFields>(
        props.form as UseFormProps<CredentialResponderFields>
      )

      const output = methods.watch("output")

      return <FormProvider {...methods}>
        <PrimaryForm {...props} title="responder.title">
          <LongTextInput {...props} sourceCode field="responder.unsigned" />

          <AlertOutput {...props} field="responder.alert" />

          <FormMainAction {...props} title="responder.sign" action={
            methods.handleSubmit(props.sign(methods))
          } />

          {output ? <LongOutput {...props} field="output" /> : undefined}
        </PrimaryForm>
      </FormProvider>
    }
  } />
