/**
 *  Copyright 2023 OwlMeans
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */


import { FormProvider, useForm, UseFormProps } from 'react-hook-form'
import { StoreLoginFields, StoreLoginImplProps, MainFooter } from '../../../common'
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
    <MainFooter />
  </FormProvider>
}