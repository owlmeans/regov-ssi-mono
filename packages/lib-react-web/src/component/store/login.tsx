import React from 'react'

import {
  FormProvider,
  useForm,
  UseFormProps
} from 'react-hook-form'
import {
  StoreLoginFields,
  StoreLoginImplProps
} from '@owlmeans/regov-lib-react'
import { webCryptoHelper } from '@owlmeans/regov-ssi-common'

import {
  FormMainAction,
  PasswordInput,
  PrimaryForm,
  AlertOutput
} from '../common'


export const StoreLoginWeb = (props: StoreLoginImplProps) => {
  const methods = useForm<StoreLoginFields>(props.form as UseFormProps<StoreLoginFields>)

  return <FormProvider {...methods}>
    <PrimaryForm {...props} title="login.title">
      <PasswordInput {...props} field="login.password" />
      <AlertOutput {...props} field="login.alert" />
      <FormMainAction {...props} title="login.main" action={
        methods.handleSubmit(props.login(methods, webCryptoHelper))
      } />
    </PrimaryForm>
  </FormProvider>
}