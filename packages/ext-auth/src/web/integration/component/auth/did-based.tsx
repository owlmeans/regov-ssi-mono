import React from 'react'
import {
  RegovComponentProps, withRegov, PrimaryForm, AlertOutput, FormMainAction, MainTextInput,
  didValidation, ERROR_NO_SERVER_CLIENT, ERROR_NO_EXTENSION_REGISTRY, ERROR_NO_WALLET_HANDLER_AUTH
} from '@owlmeans/regov-lib-react'
import { FormProvider, useForm, UseFormProps, UseFormReturn } from 'react-hook-form'
import { REGOV_EXT_ATUH_NAMESPACE, SERVER_REQUEST_AUTH } from '../../../../types'
import { EVENT_SEND_REQUEST, SendRequestEventParams } from '../../../types'


export const IntegratedDIDBasedAuth = withRegov<IntegratedDIDBasedAuthProps>(
  { namespace: REGOV_EXT_ATUH_NAMESPACE },
  ({ i18n, t, navigator, client, extensions, handler }) => {
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
          if (!client) {
            throw ERROR_NO_SERVER_CLIENT
          }
          if (!handler?.wallet) {
            throw ERROR_NO_WALLET_HANDLER_AUTH
          }
          if (!extensions) {
            throw ERROR_NO_EXTENSION_REGISTRY
          }
          /**
           * @PROCEED
           * 1. Server wallet API ✅
           * 2. PHP Endpoint to work with wallet ❓
           * 3. Authentication intializeion flow with the wallet 
           * 5. Create auth token VC on the server side ❓
           */

          const didAuth = await client.getVC(SERVER_REQUEST_AUTH + data.auth.did)
          await extensions.triggerEvent<SendRequestEventParams>(handler.wallet, EVENT_SEND_REQUEST, {
            recipient: data.auth.did,
            cred: didAuth,
            statusHandle: { sent: false },
            resolveSending: async () => {
              /** @TODO change state to waiting for pin response */
            },
            rejectSending: async (_) => {
              /** @TODO Show error */
            },
            resolveResponse: async (_) => {
              /**
               * @TODO
               * 1. Send authenticated response to the server
               * 2. Server should check if the response is valid and trustful
               * 3. Server should register and authenticate the user
               * 4. Server should check if the response is generated for a particular client
               * even if the client uses some guest wallet
               */
            }
          })
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