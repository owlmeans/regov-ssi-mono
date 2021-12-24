import React from 'react'

import {
  useForm,
  UseFormProps,
  FormProvider
} from 'react-hook-form'
import {
  CredentialBuilder,
  CredentialBuilderFields,
  CredentialBuilderImplProps,
  EmptyProps,
} from '@owlmeans/regov-lib-react'

import {
  MainTextInput,
  LongTextInput,
  PrimaryForm,
  FormMainAction,
  LongOutput,
  AlertOutput
} from '../../../../component'


export const MainBuilder = ({ ns }: EmptyProps) => <CredentialBuilder ns={ns} com={
  (props: CredentialBuilderImplProps) => {
    const methods = useForm<CredentialBuilderFields>(
      props.form as UseFormProps<CredentialBuilderFields>
    )

    const output = methods.watch("output")

    return <FormProvider {...methods}>
      <PrimaryForm {...props} title="builder.title">
        {/**
         * @TODO Propose types in drop down
         */}
        <MainTextInput {...props} field="builder.type" />
        {/**
         * @TODO Use https://www.npmjs.com/package/jsoneditor instead:
         */}
        <LongTextInput {...props} field="builder.context" maxRows alert="builder.alert"/>
        <LongTextInput {...props} field="builder.subject" maxRows alert="builder.alert"/>
        <LongTextInput {...props} field="builder.evidence" showImport maxRows alert="builder.alert"/>

        <AlertOutput {...props} field="builder.alert" />

        <FormMainAction {...props} title="builder.build" action={
          methods.handleSubmit(props.build(methods))
        } />

        {output ? <LongOutput {...props} field="output" file="universal-uvc.json" /> : undefined}
      </PrimaryForm>
    </FormProvider>
  }
} />
