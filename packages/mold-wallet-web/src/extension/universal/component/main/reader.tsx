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
} from '@owlmeans/regov-lib-react'

import {
  LongTextInput,
  PrimaryForm,
  FormMainAction,
  LongOutput,
  AlertOutput,
  CheckGroup
} from '../../../../component'
import { UniversalCredentialViewParams } from './types'


export const MainReader = ({ ext }: UniversalCredentialViewParams) => <CredentialReader
  ns={ext.localization?.ns} com={
    (props: CredentialReaderImplProps) => {
      const methods = useForm<CredentialReaderFields>(
        props.form as UseFormProps<CredentialReaderFields>
      )

      const output = methods.watch("output")

      return <FormProvider {...methods}>
        <PrimaryForm {...props} title="reader.title">
          <CheckGroup {...props} fields={["reader.verifyIdentityStrictly"]} />
          <LongTextInput {...props} field="reader.vo" maxRows sourceCode showImport alert="reader.alert" />

          <AlertOutput {...props} field="reader.alert" />

          <FormMainAction {...props} title="reader.validate" action={
            methods.handleSubmit(props.validate(methods))
          } />

          {output ? <LongOutput {...props} field="output" /> : undefined}
        </PrimaryForm>
      </FormProvider>
    }
  } />
