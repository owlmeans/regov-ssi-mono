import React, { FunctionComponent } from "react"

import { DIDCommConnectMeta, CommConnectionStatusHandler, ERROR_COMM_SEND_FAILED } from "@owlmeans/regov-comm"
import {
  AlertOutput, EmptyProps, ERROR_NO_WALLET_HANDLER_AUTH, FormMainAction, MainTextInput, MainTextOutput,
  PrimaryForm, RegovComponentProps, withRegov
} from "@owlmeans/regov-lib-react"
import { Presentation, REGISTRY_TYPE_IDENTITIES } from "@owlmeans/regov-ssi-core"
import { ERROR_NO_CONNECTION, REGOV_CREDENTIAL_TYPE_AUTH, REGOV_EXT_ATUH_NAMESPACE } from "../../../../types"
import { FormProvider, UseFormProps, useForm, UseFormReturn } from "react-hook-form"
import { getAuthFromPresentation, getAuthSubject, pinValidation } from "../../../../util"
import { ERROR_NO_AUTH_REQUEST, ERROR_NO_REQUESTED_IDENTITY } from "../../types"


export const DIDAuthResponse: FunctionComponent<DIDAuthResponseParams> = withRegov<DIDAuthResponseProps>(
  { namespace: REGOV_EXT_ATUH_NAMESPACE }, ({
    handler, i18n, t, request, conn, connection, navigator, extensions, close
  }) => {
  const cred = getAuthFromPresentation(request)
  const subject = cred ? getAuthSubject(cred) : undefined
  const form: UseFormProps<DIDAuthResponseFields> = {
    mode: 'onChange',
    criteriaMode: 'all',
    defaultValues: { authResponse: { did: subject?.did || '', pin: '', alert: '' } }
  }

  const methods = useForm<DIDAuthResponseFields>(form)
  const props = { i18n, t, rules: { 'authResponse.pin': pinValidation } }

  const login = (methods: UseFormReturn<DIDAuthResponseFields>) =>
    async (data: DIDAuthResponseFields) => {
      const loading = await navigator?.invokeLoading()
      try {
        if (!cred) {
          throw ERROR_NO_AUTH_REQUEST
        }
        if (!connection.helper) {
          throw ERROR_NO_CONNECTION
        }
        if (!subject) {
          throw ERROR_NO_AUTH_REQUEST
        }
        if (!handler?.wallet || !extensions) {
          throw ERROR_NO_WALLET_HANDLER_AUTH
        }
        const identity = handler.wallet.getRegistry(REGISTRY_TYPE_IDENTITIES)
          .getCredential(subject.did)
        if (!identity) {
          throw ERROR_NO_REQUESTED_IDENTITY
        }
        const ext = extensions.getExtension(REGOV_CREDENTIAL_TYPE_AUTH)
        const factory = ext.extension.getFactory(REGOV_CREDENTIAL_TYPE_AUTH)
        const unsigned = await factory.build(handler.wallet, {
          subjectData: { ...subject, pinCode: data.authResponse.pin }
        })
        const auth = await factory.sign(handler.wallet, { unsigned })
        const response = await factory.respond(
          handler.wallet, { request, credential: auth, identity: identity.credential }
        )

        if (!await connection.helper.send(response, conn)) {
          throw ERROR_COMM_SEND_FAILED
        }
        
        close()
      } catch (e) {
        methods.setError('authResponse.alert', { type: e.message || e })
      } finally {
        loading?.finish()
      }
    }

  return <FormProvider {...methods}>
    <PrimaryForm {...props} title="authResponse.title">
      <MainTextOutput {...props} field="authResponse.did" showHint />
      <MainTextInput {...props} field="authResponse.pin" />
      <AlertOutput {...props} field="authResponse.alert" />
      <FormMainAction {...props} title="authResponse.main" action={
        methods.handleSubmit(login(methods))
      } />
    </PrimaryForm>
  </FormProvider>
})

export type DIDAuthResponseFields = {
  authResponse: {
    did: string
    pin: string
    alert: string
  }
}

export type DIDAuthResponseParams = EmptyProps & {
  request: Presentation
  conn: DIDCommConnectMeta
  connection: CommConnectionStatusHandler
  close: () => void
}

export type DIDAuthResponseProps = RegovComponentProps<DIDAuthResponseParams>