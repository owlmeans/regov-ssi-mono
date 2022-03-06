import React from 'react'
import { StoreCreationFields, StoreCreationImplProps } from '../../../common'
import { useForm, FormProvider, UseFormProps, } from 'react-hook-form'
import { webCryptoHelper } from '@owlmeans/regov-ssi-core'
import {
  PrimaryForm, FormHeaderButton, MainTextInput, NewPasswordInput, FormMainAction
} from '../../component/common'


export const StoreCreationWeb = (props: StoreCreationImplProps) => {
  const methods = useForm<StoreCreationFields>(props.form as UseFormProps<StoreCreationFields>)

  return <FormProvider {...methods}>
    <PrimaryForm {...props} title="creation.title" action={
      <FormHeaderButton {...props} action={props.load} title="creation.load" />
    }>
      <MainTextInput {...props} field="creation.name" />
      <MainTextInput {...props} field="creation.login" />
      <NewPasswordInput {...props} field="creation.password" />
      <FormMainAction {...props} title="creation.create" action={
        methods.handleSubmit(props.create(methods, webCryptoHelper))
      } />
    </PrimaryForm>
  </FormProvider>
}