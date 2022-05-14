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

import { BorderColor, Close } from '@mui/icons-material'
import { Button, DialogActions, DialogContent, DialogTitle, Grid, IconButton, Paper } from '@mui/material'
import {
  CredentialEvidenceWidget, EmptyProps, RegovComponentProps, useRegov, withRegov
} from '@owlmeans/regov-lib-react'
import {
  AlertOutput, dateFormatter, EntityRenderer, EntityTextRenderer, ValidationResultWidgetWeb, 
  WalletFormProvider
} from '@owlmeans/regov-lib-react'
import { CredentialSubject, getCompatibleSubject, Presentation, REGISTRY_SECTION_PEER, 
  REGISTRY_TYPE_CREDENTIALS, REGISTRY_TYPE_REQUESTS } from '@owlmeans/regov-ssi-core'
import { Extension, ValidationResult, VALIDATION_FAILURE_CHECKING, VALIDATION_KIND_RESPONSE } from '@owlmeans/regov-ssi-core'
import React, { Fragment, FunctionComponent, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  REGOV_EXT_SIGNATURE_NAMESPACE, REGOV_CREDENTIAL_TYPE_SIGNATURE, SignatureSubject, 
  SignatureRequestSubject, ERROR_WIDGET_AUTHENTICATION, ERROR_WIDGET_EXTENSION
} from '../../types'
import { getSignatureResponseFromPresentation, getSignatureRequestFromPresentation } from '../../util'
import { typeFormatterFacotry } from '../formatter'


export const SignatureRequestResponseWeb: FunctionComponent<SignatureRequestResponseParams> =
  withRegov<SignatureRequestResponseProps>({ namespace: REGOV_EXT_SIGNATURE_NAMESPACE }, ({
    t, i18n, close, ext, navigator, credential: presentation
  }) => {
    const { handler, extensions } = useRegov()
    const request = handler.wallet && handler.wallet.getRegistry(REGISTRY_TYPE_REQUESTS)
      .getCredential<CredentialSubject, Presentation>(presentation.id)

    const methods = useForm<SignatureReuqestResponseFields>({
      mode: 'onChange',
      criteriaMode: 'all',
      defaultValues: {
        signature: {
          response: {
            alert: '',
          }
        }
      }
    })

    const [result, setValidationResult] = useState<ValidationResult>({
      valid: false,
      trusted: false,
      cause: VALIDATION_FAILURE_CHECKING,
      evidence: []
    })

    const signature = getSignatureResponseFromPresentation(presentation)
    const subject = signature && getCompatibleSubject<SignatureSubject>(signature)

    const [counter, setCounter] = useState<number>(0)
    const reload = () => setCounter(counter + 1)

    const factory = ext.getFactory(REGOV_CREDENTIAL_TYPE_SIGNATURE)

    useEffect(() => {
      if (!request) {
        methods.setError('signature.response.alert', { type: 'noRequest' })
      }
      if (request?.credential && subject) {
        const cred = getSignatureRequestFromPresentation(request.credential)
        if (cred) {
          const requestSubject = getCompatibleSubject<SignatureRequestSubject>(cred)
          if (subject.documentHash !== requestSubject.documentHash) {
            methods.setError('signature.response.alert', { type: 'wrongDocument' })
          }
        }
      }
    }, [request?.credential.id])

    useEffect(() => {
      (async () => {
        if (!handler.wallet || !extensions || !signature) {
          return
        }
        const res = await factory.validate(handler.wallet, {
          presentation, credential: signature, extensions: extensions.registry,
          kind: VALIDATION_KIND_RESPONSE
        })
        setValidationResult(res)
      })()
    }, [signature?.id, counter])

    const state = methods.getFieldState('signature.response.alert')

    const accept = async () => {
      const loader = await navigator?.invokeLoading()
      try {
        if (!handler.wallet) {
          throw ERROR_WIDGET_AUTHENTICATION
        }
        if (!ext) {
          throw ERROR_WIDGET_EXTENSION
        }
        if (!request) {
          methods.setError('signature.response.alert', { type: 'noRequest' })
          return
        }
        if (!signature) {
          methods.setError('signature.response.alert', { type: 'wrongDocument' })
          return
        }

        await handler.wallet.getRegistry(REGISTRY_TYPE_REQUESTS).removeCredential(request.credential)
        const item = await handler.wallet.getRegistry(REGISTRY_TYPE_CREDENTIALS)
          .addCredential(signature, REGISTRY_SECTION_PEER)

        item.meta.title = subject?.name || t('signature.response.credential.title', {
          type: subject?.docType || 'unknown',
          hash: subject?.documentHash || 'unhashed'
        })

        handler.notify()

        loader?.success(t('signature.response.credential.added'))

        close && close()
      } catch (error) {
        console.error(error)
        loader?.error(error.message)
      } finally {
        loader?.finish()
      }
    }

    return <Fragment>
      <DialogTitle>
        <Grid container direction="row" justifyContent="space-between" alignItems="flex-start">
          <Grid item xs={8}>
            {`${t('signature.view.title', { name: request?.meta.title })}`}
          </Grid>
          <Grid item xs={4} container direction="row" justifyContent="flex-end" alignItems="flex-start">
            <Grid item>
              {close && <IconButton onClick={close}><Close /></IconButton>}
            </Grid>
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent dividers={true}>
        {subject && signature
          ? <Fragment>
            <WalletFormProvider {...methods}>
              <AlertOutput t={t} i18n={i18n} field="signature.response.alert" />
            </WalletFormProvider>
            <Grid container direction="column" justifyContent="flex-start" alignItems="stretch">
              <Grid item container direction="row" justifyContent="space-between" alignItems="stretch">
                <Grid item xs={12} sm={6} md={7} px={1}>
                  <Paper elevation={3}>
                    <EntityRenderer t={t} entity="signature.view" title={
                      <Fragment>
                        <Grid container direction="row" spacing={1} justifyContent="flex-start" alignItems="flex-start">
                          <Grid item>
                            <BorderColor fontSize="large" />
                          </Grid>
                          <Grid item>{subject.name}</Grid>
                        </Grid>
                      </Fragment>
                    } subject={subject}>
                      {subject.description?.trim() !== "" && <EntityTextRenderer field="description" showLabel />}
                      <EntityTextRenderer field="documentHash" small showLabel />
                      {subject.filename?.trim() !== "" && <EntityTextRenderer field="filename" showLabel />}
                      {subject.url?.trim() !== "" && <EntityTextRenderer field="url" showLabel />}
                      {subject.authorId?.trim() !== "" && <EntityTextRenderer field="authorId" showLabel />}
                      <Grid item container direction="row" justifyContent="space-between" alignItems="flex-start">
                        <EntityTextRenderer field="signedAt" showHint small netSize={6} formatter={dateFormatter} />
                        <EntityTextRenderer field="docType" showHint small netSize={6} formatter={typeFormatterFacotry(t)} />
                      </Grid>
                      <Grid item container direction="row" justifyContent="space-between" alignItems="flex-start">
                        <EntityTextRenderer field="creationDate" showHint small netSize={6} formatter={dateFormatter} />
                        {subject.version?.trim() !== "" && <EntityTextRenderer field="version" showHint small netSize={6} />}
                      </Grid>
                    </EntityRenderer>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={5} px={1}>
                  <Paper elevation={3}>
                    <ValidationResultWidgetWeb result={result} reload={reload} />
                  </Paper>
                </Grid>
              </Grid>
              <Grid item pt={1} px={1}>
                <CredentialEvidenceWidget credential={signature} />
              </Grid>
            </Grid>
          </Fragment>
          : <Fragment>
          </Fragment>}
      </DialogContent>
      <DialogActions>
        {
          !state.invalid && result.valid && result.trusted
            ? <Button onClick={accept}>{`${t('signature.response.accept')}`}</Button>
            : null
        }
        <Button onClick={close}>{`${t('signature.response.close')}`}</Button>
      </DialogActions>
    </Fragment>
  })

export type SignatureRequestResponseParams = EmptyProps & {
  ext: Extension
  credential: Presentation
  close?: () => void
}

export type SignatureRequestResponseProps = RegovComponentProps<SignatureRequestResponseParams>

export type SignatureReuqestResponseFields = {
  signature: {
    response: {
      alert: string
    }
  }
}