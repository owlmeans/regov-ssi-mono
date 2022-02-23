import { BorderColor, Close } from '@mui/icons-material'
import { Button, DialogActions, DialogContent, DialogTitle, Grid, IconButton, Paper } from '@mui/material'
import {
  CredentialEvidenceWidget, EmptyProps, RegovComponentProps, useRegov, withRegov
} from '@owlmeans/regov-lib-react'
import {
  AlertOutput, dateFormatter, EntityRenderer, EntityTextRenderer, ValidationResultWidget, WalletFormProvider
} from '@owlmeans/regov-mold-wallet-web'
import { CredentialSubject, getCompatibleSubject, Presentation, REGISTRY_TYPE_REQUESTS } from '@owlmeans/regov-ssi-core'
import { Extension, ValidationResult, VALIDATION_FAILURE_CHECKING } from '@owlmeans/regov-ssi-extension'
import React, { Fragment, FunctionComponent, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  REGOV_EXT_SIGNATURE_NAMESPACE, REGOV_CREDENTIAL_TYPE_SIGNATURE, SignatureSubject, SignatureRequestSubject
} from '../../types'
import { getSignatureResponseFromPresentation, getSignatureRequestFromPresentation } from '../../util'
import { typeFormatterFacotry } from '../formatter'


export const SignatureRequestResponseWeb: FunctionComponent<SignatureRequestResponseParams> =
  withRegov<SignatureRequestResponseProps>({ namespace: REGOV_EXT_SIGNATURE_NAMESPACE }, ({
    t, i18n, close, ext, credential: presentation
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
        const res = await factory.validationFactory(handler.wallet, {
          credential: signature, extensions: extensions.registry
        })
        setValidationResult(res)
      })()
    }, [signature?.id, counter])


    return <Fragment>
      <DialogTitle>
        <Grid container direction="row" justifyContent="space-between" alignItems="flex-start">
          <Grid item xs={8}>
            {t('signature.view.title', { name: request?.meta.title })}
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
                    <ValidationResultWidget result={result} reload={reload} />
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
        <Button onClick={close}>{t('signature.response.close')}</Button>
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