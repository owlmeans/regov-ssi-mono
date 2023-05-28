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


import { StoreCreationFields, StoreCreationImplProps, MainFooter } from '../../../common'
import { useForm, FormProvider, UseFormProps, } from 'react-hook-form'
import { cryptoHelper } from '@owlmeans/regov-ssi-core'
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
        methods.handleSubmit(props.create(methods, cryptoHelper))
      } />
    </PrimaryForm>
    <MainFooter />
  </FormProvider>
}