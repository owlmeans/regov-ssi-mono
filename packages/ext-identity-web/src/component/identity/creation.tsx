import React, {
  FunctionComponent
} from 'react'
import { 
  useForm, 
  UseFormProps 
} from 'react-hook-form'

import {
  EmptyProps,
  MainModalEventTriggerParams,
  RegovCompoentProps,
  withRegov
} from '@owlmeans/regov-lib-react'
import { REGOV_IDENTITY_DEFAULT_NAMESPACE } from '../../types'
import {
  MainTextInput,
  MainTextOutput,
  PrimaryForm,
  WalletFormProvider
} from '@owlmeans/regov-mold-wallet-web'


export const IdentityCreation: FunctionComponent<IdentityCreationParams> = withRegov<IdentityCreationProps>(
  { namespace: REGOV_IDENTITY_DEFAULT_NAMESPACE }, ({t, i18n}) => {
    const form: UseFormProps<IdentityCreationFields> = {
      mode: 'onChange',
      criteriaMode: 'all',
      defaultValues: {
        creation: {
          identifier: "xxxxx",
          sourceApp: "Example App",
          uuid: "xxxx-yyy-zzzz",
          createdAt: new Date()
        },
        name: '',
      }
    }

    const _props = {
      t, i18n, form: form as UseFormProps
    }

    const methods = useForm<IdentityCreationFields>(form)

    return <WalletFormProvider {...methods}>
      <PrimaryForm {..._props} title="creation.title">
        <MainTextInput {..._props} field="name" />
        <MainTextOutput {..._props} field="creation.identifier" showHint />
        <MainTextOutput {..._props} field="creation.sourceApp" showHint />
        <MainTextOutput {..._props} field="creation.uuid" showHint />
        <MainTextOutput {..._props} field="creation.createdAt" showHint />
      </PrimaryForm>
    </WalletFormProvider>
  })

export type IdentityCreationParams = MainModalEventTriggerParams & EmptyProps

export type IdentityCreationProps = RegovCompoentProps<IdentityCreationParams>

export type IdentityCreationFields = {
  creation: {
    identifier: string
    sourceApp: string
    uuid: string
    createdAt: Date
  }
  name: string
}