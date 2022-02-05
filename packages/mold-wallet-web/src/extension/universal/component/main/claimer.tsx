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
} from '@owlmeans/regov-lib-react'

import {
  LongTextInput,
  PrimaryForm,
  FormMainAction,
  LongOutput,
  AlertOutput
} from '../../../../component'
import { UniversalCredentialViewParams } from './types'
import { UNIVERSAL_EXTENSION_CRED_TYPE } from '@owlmeans/regov-ssi-extension'


export const MainClaimer = ({ ext }: UniversalCredentialViewParams) => <CredentialClaimer
  ns={ext.localization?.ns} ext={ext} defaultType={UNIVERSAL_EXTENSION_CRED_TYPE}
  claimType={ext.schema.details.types?.claim} com={(props: CredentialClaimerImplProps) => {
    const methods = useForm<CredentialClaimerFields>(
      props.form as UseFormProps<CredentialClaimerFields>
    )

    const output = methods.watch("output")

    return <FormProvider {...methods}>
      <PrimaryForm {...props} title="claimer.title">
        <LongTextInput {...props} field="claimer.unsigned" showImport sourceCode maxRows alert="claimer.alert" />
        <LongTextInput {...props} field="claimer.holder" showImport sourceCode maxRows alert="claimer.alert" />

        <AlertOutput {...props} field="claimer.alert" />

        <FormMainAction {...props} title="claimer.claim" action={
          methods.handleSubmit(props.claim(methods))
        } />

        {output ? <LongOutput {...props} field="output" file="universal-claim.json" /> : undefined}
      </PrimaryForm>
    </FormProvider>
  }} />
