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
} from '@owlmeans/regov-lib-react'

import {
  MainTextInput,
  LongTextInput,
  PrimaryForm,
  FormMainAction,
  LongOutput,
  AlertOutput
} from '../../../../component'
import { UniversalCredentialViewParams } from './types'
import { UNIVERSAL_EXTENSION_CRED_TYPE } from '@owlmeans/regov-ssi-extension'


export const MainBuilder = ({ ext }: UniversalCredentialViewParams) => <CredentialBuilder
  ns={ext.localization?.ns} ext={ext} defaultType={UNIVERSAL_EXTENSION_CRED_TYPE} com={
    (props: CredentialBuilderImplProps) => {
      const methods = useForm<CredentialBuilderFields>(
        props.form as UseFormProps<CredentialBuilderFields>
      )

      const output = methods.watch("output")

      return <FormProvider {...methods}>
        <PrimaryForm {...props} title="builder.title">
          <MainTextInput {...props} field="name" />
          {/**
           * @TODO Propose types in drop down
           */}
          <MainTextInput {...props} field="builder.type" />
          {/**
           * @TODO Use https://www.npmjs.com/package/jsoneditor instead:
           */}
          <LongTextInput {...props} field="builder.context" showImport maxRows sourceCode alert="builder.alert" />
          <LongTextInput {...props} field="builder.subject" showImport maxRows sourceCode alert="builder.alert" />
          <LongTextInput {...props} field="builder.evidence" showImport maxRows sourceCode alert="builder.alert" />
          <LongTextInput {...props} field="builder.schema" showImport maxRows sourceCode alert="builder.alert" />

          <AlertOutput {...props} field="builder.alert" />

          <FormMainAction {...props} title="builder.build" action={
            methods.handleSubmit(props.build(methods))
          } />

          {output ? <LongOutput {...props} field="output" file="universal-uvc.json" 
            actions={[
              {title: 'output.save', 'action': props.save(methods) }
            ]}/> : undefined}
        </PrimaryForm>
      </FormProvider>
    }
  } />
