import React from 'react'
import { FormProvider, useForm, UseFormProps } from 'react-hook-form'
import { StoreLoginFields, StoreLoginImplProps } from '../../../common'
import { webCryptoHelper } from '@owlmeans/regov-ssi-core'
import {
  FormMainAction, PasswordInput, PrimaryForm, AlertOutput, FormHeaderButton
} from '../../component/common'


export const StoreLoginWeb = (props: StoreLoginImplProps) => {
  const methods = useForm<StoreLoginFields>(props.form as UseFormProps<StoreLoginFields>)

  return <FormProvider {...methods}>
    <PrimaryForm {...props} title="login.title" action={
      <FormHeaderButton {...props} action={props.list} title="login.list" />
    }>
      <PasswordInput {...props} field="login.password" />
      <AlertOutput {...props} field="login.alert" />
      <FormMainAction {...props} title="login.main" action={
        methods.handleSubmit(props.login(methods, webCryptoHelper))
      } />
    </PrimaryForm>
  </FormProvider>
}