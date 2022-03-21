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

const Buffer = require('buffer/').Buffer

import { Extension, ValidationResult, VALIDATION_FAILURE_CHECKING } from '@owlmeans/regov-ssi-core'
import { Credential, getCompatibleSubject } from '@owlmeans/regov-ssi-core'
import React, { Fragment, FunctionComponent, useEffect, useState } from 'react'
import { Button, DialogActions, DialogContent, DialogTitle, Grid, IconButton, Paper } from '@mui/material'
import { REGOV_EXT_SIGNATURE_NAMESPACE, SignatureSubject } from '../../types'
import { BorderColor, Close } from '@mui/icons-material'
import { REGOV_CREDENTIAL_TYPE_SIGNATURE } from '../../types'
import {
  CredentialEvidenceWidget, EmptyProps, RegovComponentProps, useRegov, ValidationResultWidgetWeb,
  AlertOutput, dateFormatter, EntityRenderer, EntityTextRenderer, FileProcessorWeb, PrimaryForm,
  WalletFormProvider, withRegov
} from '@owlmeans/regov-lib-react'
import { useForm } from 'react-hook-form'
import { typeFormatterFacotry } from '../formatter'


export const SignatureView: FunctionComponent<SignatureViewParams> = withRegov<SignatureViewProps>({
  namespace: REGOV_EXT_SIGNATURE_NAMESPACE
}, ({ t, i18n, credential, navigator, close, ext }) => {
  const { handler, extensions } = useRegov()
  const factory = ext.getFactory(REGOV_CREDENTIAL_TYPE_SIGNATURE)
  const subject = getCompatibleSubject<SignatureSubject>(credential)

  const [counter, setCounter] = useState<number>(0)
  const reload = () => setCounter(counter + 1)

  const [result, setValidationResult] = useState<ValidationResult>({
    valid: false,
    trusted: false,
    cause: VALIDATION_FAILURE_CHECKING,
    evidence: []
  })

  useEffect(() => {
    (async () => {
      if (!handler.wallet || !extensions) {
        return
      }
      const res = await factory.validate(handler.wallet, {
        credential, extensions: extensions.registry
      })
      setValidationResult(res)
    })()
  }, [credential.id, counter])

  const methods = useForm<SignatureViewFields>({
    mode: 'onChange',
    criteriaMode: 'all',
    defaultValues: {
      signature: {
        view: {
          file: '',
          alert: ''
        }
      }
    }
  })

  const props = { t, i18n }

  const processFile = async () => {
    const loader = await navigator?.invokeLoading()
    try {
      const content = methods.getValues('signature.view.file')
      if (content !== '' && handler && handler.wallet) {
        const hash = handler.wallet.ssi.crypto.hash(content)

        if (hash === subject.documentHash) {
          methods.setError('signature.view.alert', { type: 'success', message: 'matches' })
        } else {
          methods.setError('signature.view.alert', { type: 'error', message: 'notmatch' })
        }
      }
    } catch (error) {
      loader?.error(error.message)
      console.error(error)
    } finally {
      loader?.finish()
    }
  }

  const onDrop = async (files: File[]) => {
    const loader = await navigator?.invokeLoading()
    if (files.length) {
      const reader = new FileReader()

      reader.onabort = () => {
        methods.setError('signature.view.file', { type: 'file.aborted' })
        loader?.finish()
      }

      reader.onerror = () => {
        methods.setError('signature.view.file', { type: 'file.error' })
        loader?.finish()
      }

      reader.onload = () => {
        try {
          const data = reader.result as ArrayBuffer

          if (handler && handler.wallet) {
            const hash = handler.wallet.ssi.crypto.hash(Buffer.from(data))

            if (hash === subject.documentHash) {
              methods.setError('signature.view.alert', { type: 'success', message: 'matches' })
            } else {
              methods.setError('signature.view.alert', { type: 'error', message: 'notmatch' })
            }
          }
        } catch (error) {
          loader?.error(error.message)
          console.error(error)
        } finally {
          loader?.finish()
        }
      }

      reader.readAsArrayBuffer(files[0])
    }
  }

  return <Fragment>
    <DialogTitle>
      <Grid container direction="row" justifyContent="space-between" alignItems="flex-start">
        <Grid item xs={8}>
          {t('signature.view.title', { name: subject.name })}
        </Grid>
        <Grid item xs={4} container direction="row" justifyContent="flex-end" alignItems="flex-start">
          <Grid item>
            {close && <IconButton onClick={close}><Close /></IconButton>}
          </Grid>
        </Grid>
      </Grid>
    </DialogTitle>
    <DialogContent dividers={true}>
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
              <WalletFormProvider {...methods}>
                <PrimaryForm {...props} title="signature.view.upload">
                  <AlertOutput {...props} field="signature.view.alert" />

                  <FileProcessorWeb {...props} field="signature.view.file"
                    onDrop={onDrop} process={processFile} square={true} />
                </PrimaryForm>
              </WalletFormProvider>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={5} px={1}>
            <Paper elevation={3}>
              <ValidationResultWidgetWeb result={result} reload={reload} />
            </Paper>
          </Grid>
        </Grid>
        <Grid item pt={1} px={1}>
          <CredentialEvidenceWidget credential={credential} />
        </Grid>
      </Grid>
    </DialogContent>
    <DialogActions>
      <Button onClick={close}>{t('signature.response.close')}</Button>
    </DialogActions>
  </Fragment>
})

export type SignatureViewParams = EmptyProps & {
  ext: Extension
  close: () => void
  credential: Credential
}

export type SignatureViewProps = RegovComponentProps<SignatureViewParams>

export type SignatureViewFields = {
  signature: {
    view: {
      file: string
      alert: string
    }
  }
}