import React from 'react'
import {
  RegovComponentProps, withRegov, PrimaryForm, AlertOutput, FormMainAction, MainTextInput, didValidation
} from '@owlmeans/regov-lib-react'
import { FormProvider, useForm, UseFormProps, UseFormReturn } from 'react-hook-form'
import { REGOV_EXT_ATUH_NAMESPACE } from '../../../../types'


export const IntegratedDIDBasedAuth = withRegov<IntegratedDIDBasedAuthProps>(
  { namespace: REGOV_EXT_ATUH_NAMESPACE },
  ({ i18n, t, navigator }) => {
    const form: UseFormProps<IntegratedDIDBasedAuthFields> = {
      mode: 'onChange',
      criteriaMode: 'all',
      defaultValues: {
        auth: {
          did: '',
          alert: ''
        }
      }
    }

    const methods = useForm<IntegratedDIDBasedAuthFields>(form)

    const props = {
      i18n, t, rules: { 'auth.did': didValidation }
    }

    const login = (methods: UseFormReturn<IntegratedDIDBasedAuthFields>) =>
      async (data: IntegratedDIDBasedAuthFields) => {
        console.log(methods, data)
        const loading = await navigator?.invokeLoading()
        try {
          /**
           * @PROCEED
           * 1. Server wallet API
           * 2. PHP Endpoint to work with wallet
           * 3. Authentication intializeion flow with the wallet
           * 5. Create auto token VC
           */
          await new Promise(resolve => setTimeout(() => resolve(undefined), 4000))
        } catch (e) {
          console.log(e)
          methods.setError('auth.alert', { type: 'wrong', message: e.message || e })
        } finally {
          loading?.finish()
        }
      }

    return <FormProvider {...methods}>
      <PrimaryForm {...props} title="auth.title">
        <MainTextInput {...props} field="auth.did" />
        <AlertOutput {...props} field="auth.alert" />
        <FormMainAction {...props} title="auth.main" action={
          methods.handleSubmit(login(methods))
        } />
      </PrimaryForm>
    </FormProvider>
  }
)

export type IntegratedDIDBasedAuthFields = {
  auth: {
    did: string
    alert: string
  }
}

export type IntegratedDIDBasedAuthParams = {
}

export type IntegratedDIDBasedAuthProps = RegovComponentProps<IntegratedDIDBasedAuthParams>