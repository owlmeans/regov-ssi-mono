import React, { useMemo } from 'react'
import {
  RegovComponentProps, withRegov, PrimaryForm, AlertOutput, FormMainAction, MainTextInput,
  didValidation, ERROR_NO_SERVER_CLIENT, ERROR_NO_EXTENSION_REGISTRY, ERROR_NO_WALLET_HANDLER_AUTH,
  WalletNavigatorMethod, BasicNavigator, EmptyProps, MainTextOutput
} from '@owlmeans/regov-lib-react'
import { FormProvider, useForm, UseFormProps, UseFormReturn } from 'react-hook-form'
import {
  ERROR_NO_AUTHENTICATION_FROM_EXTERNAL_WALLET,
  ERROR_WRONG_AUTHENTICATION,
  REGOV_CREDENTIAL_TYPE_AUTH,
  REGOV_EXT_ATUH_NAMESPACE, SERVER_INTEGRATION_ALIAS, SERVER_PROVIDE_AUTH, SERVER_REQUEST_AUTH
} from '../../../../types'
import {
  EVENT_INIT_CONNECTION, ERROR_COMM_CANT_SEND, InitCommEventParams, DIDCommListner
} from '@owlmeans/regov-comm'
import { DIDDocument, ERROR_NO_IDENTITY, Presentation } from '@owlmeans/regov-ssi-core'
import { ERROR_INTEGRATED_AUTH_WRONG_PIN, ERROR_INTEGRATED_SERVER_CANT_LOGIN } from '../../types'
import { getAuthFromPresentation, getAuthSubject } from '../../../../util'


export const IntegratedDIDBasedAuth = withRegov<IntegratedDIDBasedAuthProps, IntegratedDIDBasedAuthNavigator>(
  { namespace: REGOV_EXT_ATUH_NAMESPACE },
  ({ auth, i18n, t, navigator, client, extensions, handler }) => {
    const pin = useMemo(() => Array(4).map(_ => Math.round(Math.random() * 9)).join(''), [])

    const form: UseFormProps<IntegratedDIDBasedAuthFields> = {
      mode: 'onChange',
      criteriaMode: 'all',
      defaultValues: { auth: { pin, did: '', alert: '' } }
    }

    const methods = useForm<IntegratedDIDBasedAuthFields>(form)
    const props = { i18n, t, rules: { 'auth.did': didValidation } }

    const login = (methods: UseFormReturn<IntegratedDIDBasedAuthFields>) =>
      async (data: IntegratedDIDBasedAuthFields) => {
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

          const sender = handler.wallet?.getIdentity()?.credential.holder as DIDDocument

          const didAuth = await client.getVC(SERVER_REQUEST_AUTH + data.auth.did)
          console.log(didAuth)
          await extensions.triggerEvent<InitCommEventParams>(handler.wallet, EVENT_INIT_CONNECTION, {
            statusHandle: { established: false },
            resolveConnection: async (helper) => {
              if (!handler.wallet?.did.helper().isDIDDocument(sender)) {
                throw ERROR_NO_IDENTITY
              }
              const listner: DIDCommListner = {
                established: async (conn) => {
                  const sent = await helper.send(didAuth, conn)
                  if (!sent) {
                    throw ERROR_COMM_CANT_SEND
                  }
                },
                receive: async (_, doc) => {
                  /**
                   * @TODO
                   * 1. Send authenticated response to the server
                   * 2. Server should check if the response is valid and trustful
                   * 3. Server should register and authenticate the user
                   * 4. Server should check if the response is generated for a particular client
                   * even if the client uses some guest wallet
                   */
                  try {
                    if (!handler?.wallet) {
                      throw ERROR_NO_WALLET_HANDLER_AUTH
                    }

                    const cred = getAuthFromPresentation(doc as Presentation)
                    if (!cred) {
                      throw ERROR_NO_AUTHENTICATION_FROM_EXTERNAL_WALLET
                    }

                    const ext = extensions.getExtension(REGOV_CREDENTIAL_TYPE_AUTH)
                    const factory = ext.extension.getFactory(REGOV_CREDENTIAL_TYPE_AUTH)
                    const result = await factory.validate(handler.wallet, {
                      presentation: doc as Presentation,
                      credential: cred,
                      extensions: extensions.registry
                    })
                    if (!result.valid) {
                      throw ERROR_WRONG_AUTHENTICATION
                    }
                    const subject = getAuthSubject(cred)
                    if (pin !== subject.pinCode) {
                      throw ERROR_INTEGRATED_AUTH_WRONG_PIN
                    }

                    const authResponse = await client.sendVC<Presentation, AuthIntengratedServerResponse>({
                      uri: SERVER_PROVIDE_AUTH,
                      serverAlias: SERVER_INTEGRATION_ALIAS
                    }, doc as Presentation)

                    if (authResponse.error) {
                      throw authResponse.error
                    }
                    if (!authResponse.data || !await auth(authResponse.data)) {
                      throw ERROR_INTEGRATED_SERVER_CANT_LOGIN
                    }

                    /**
                     * @TODO Show a success message from the server if any
                     */

                    navigator?.next()
                  } finally {
                    helper.removeListener(listner)
                    loading?.finish()
                  }
                }
              }
              await helper.addListener(listner)
              await helper.connect({ recipientId: data.auth.did, sender })
            },
            rejectConnection: async (err) => {
              console.error(err)
              throw err
            }
          })
        } catch (e) {
          console.log(e)
          methods.setError('auth.alert', { type: 'wrong', message: e.message || e })
          loading?.finish()
        }
      }

    return <FormProvider {...methods}>
      <PrimaryForm {...props} title="auth.title">
        <MainTextInput {...props} field="auth.did" />
        <MainTextOutput {...props} field="auth.pin" />
        <AlertOutput {...props} field="auth.alert" />
        <FormMainAction {...props} title="auth.main" action={
          methods.handleSubmit(login(methods))
        } />
      </PrimaryForm>
    </FormProvider>
  }
)

type AuthIntengratedServerResponse = {
  token: string
}

export type IntegratedDIDBasedAuthFields = {
  auth: {
    did: string
    pin: string
    alert: string
  }
}

export type IntegratedDIDBasedAuthParams = EmptyProps & {
  auth: (data: AuthIntengratedServerResponse) => Promise<boolean>
}

export type IntegratedDIDBasedAuthProps = RegovComponentProps<
  IntegratedDIDBasedAuthParams, {}, {}, IntegratedDIDBasedAuthNavigator
>

export type IntegratedDIDBasedAuthNavigator = BasicNavigator & {
  next: WalletNavigatorMethod<undefined>
}