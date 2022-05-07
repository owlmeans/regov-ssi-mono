/**
 *  Copyright 2022 OwlMeans
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

import React, { FunctionComponent, useMemo } from 'react'
import {
  RegovComponentProps, withRegov, PrimaryForm, AlertOutput, FormMainAction, MainTextInput,
  didValidation, ERROR_NO_SERVER_CLIENT, ERROR_NO_EXTENSION_REGISTRY, ERROR_NO_WALLET_HANDLER_AUTH,
  WalletNavigatorMethod, BasicNavigator, EmptyProps, MainTextOutput
} from '@owlmeans/regov-lib-react'
import { FormProvider, useForm, UseFormProps, UseFormReturn } from 'react-hook-form'
import {
  ERROR_NO_AUTHENTICATION_FROM_EXTERNAL_WALLET, ERROR_WRONG_AUTHENTICATION,
  REGOV_AUTH_REQUEST_TYPE, REGOV_CREDENTIAL_TYPE_AUTH, REGOV_EXT_ATUH_NAMESPACE,
  SERVER_INTEGRATION_ALIAS, SERVER_PROVIDE_AUTH
} from '../../../../types'
import {
  EVENT_INIT_CONNECTION, ERROR_COMM_CANT_SEND, InitCommEventParams, DIDCommListner
} from '@owlmeans/regov-comm'
import { DIDDocument, ERROR_NO_IDENTITY, Presentation, ValidationResult } from '@owlmeans/regov-ssi-core'
import { ERROR_INTEGRATED_AUTH_WRONG_PIN, ERROR_INTEGRATED_SERVER_CANT_LOGIN } from '../../types'
import { getAuthFromPresentation, getAuthSubject } from '../../../../util'


export const IntegratedDIDBasedAuth: FunctionComponent<IntegratedDIDBasedAuthParams>
  = withRegov<IntegratedDIDBasedAuthProps, IntegratedDIDBasedAuthNavigator>(
    { namespace: REGOV_EXT_ATUH_NAMESPACE },
    ({ auth, close, i18n, t, navigator, client, extensions, handler }) => {
      const pin = useMemo(
        () => Array(4).fill(0).map(_ => Math.round(Math.random() * 9)).join(''), []
      )
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
             * 2. PHP Endpoint to work with wallet 🏷
             * 3. Authentication intializeion flow with the wallet 🏇 
             * 5. Create auth token VC on the server side ✅
             */

            const senderIdentity = handler.wallet?.getIdentity()?.credential

            const sender = senderIdentity?.issuer as unknown as DIDDocument

            const factory = extensions.getExtension(REGOV_CREDENTIAL_TYPE_AUTH)
              .extension.getFactory(REGOV_AUTH_REQUEST_TYPE)
            const unsigned = await factory.build(handler.wallet, {
              subjectData: {
                did: data.auth.did,
                createdAt: (new Date).toISOString()
              }
            })
            const didAuth = await factory.request(handler.wallet, {
              unsignedRequest: unsigned,
              identity: senderIdentity
            })

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
                     * 1. Send authenticated response to the server 🏇
                     * 2. Server should check if the response is valid and trustful ✅
                     * 3. Server should register and authenticate the user 🏷
                     * 4. Server should check if the response is generated for a particular client
                     * even if the client uses some guest wallet ❓
                     */
                    try {
                      if (!handler?.wallet) {
                        throw ERROR_NO_WALLET_HANDLER_AUTH
                      }

                      const cred = getAuthFromPresentation(doc as Presentation)
                      if (!cred) {
                        throw ERROR_NO_AUTHENTICATION_FROM_EXTERNAL_WALLET
                      }

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

                      console.log('Integrated server response: ', authResponse)
                      /**
                       * @TODO 
                       * 1. Call some provided callback to finish authentication
                       * 2. Fallback to check of server check response
                       */

                      if (!authResponse || !await auth(authResponse)) {
                        throw ERROR_INTEGRATED_SERVER_CANT_LOGIN
                      }

                      /**
                       * @TODO Show a success message from the server if any
                       */

                      close && close()
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
            console.error(e)
            methods.setError('auth.alert', { type: 'wrong', message: e.message || e })
            loading?.finish()
          }
        }

      return <FormProvider {...methods}>
        <PrimaryForm {...props} title="auth.title">
          <MainTextInput {...props} field="auth.did" />
          <MainTextOutput {...props} field="auth.pin" showHint showLabel />
          <AlertOutput {...props} field="auth.alert" />
          <FormMainAction {...props} title="auth.main" action={
            methods.handleSubmit(login(methods))
          } />
        </PrimaryForm>
      </FormProvider>
    }
  )

type AuthIntengratedServerResponse = {
  token?: string
} | ValidationResult

export type IntegratedDIDBasedAuthFields = {
  auth: {
    did: string
    pin: string
    alert: string
  }
}

export type IntegratedDIDBasedAuthParams = EmptyProps & {
  auth: (data: AuthIntengratedServerResponse) => Promise<boolean>
  close?: () => void
}

export type IntegratedDIDBasedAuthProps = RegovComponentProps<
  IntegratedDIDBasedAuthParams, {}, {}, IntegratedDIDBasedAuthNavigator
>

export type IntegratedDIDBasedAuthNavigator = BasicNavigator & {
  next: WalletNavigatorMethod<undefined>
}