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

import { EmptyProps, RegovComponentProps, useRegov, withRegov } from '@owlmeans/regov-lib-react'
import { CredentialActionGroup, LongOutput, MainTextOutput, PrimaryForm, WalletFormProvider } from '@owlmeans/regov-lib-react'
import {
  getCompatibleSubject, Presentation, Credential, REGISTRY_TYPE_REQUESTS, REGISTRY_SECTION_OWN
} from '@owlmeans/regov-ssi-core'
import { Extension } from '@owlmeans/regov-ssi-core'
import React, { Fragment, FunctionComponent } from 'react'
import { useForm } from 'react-hook-form'
import { REGOV_EXT_SIGNATURE_NAMESPACE, SignatureRequestSubject } from '../../types'
import { getSignatureRequestFromPresentation } from '../../util'

import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'


export const SignatureRequestViewWeb: FunctionComponent<SignatureRequestViewParams> =
  withRegov<SignatureRequestViewProps>({
    namespace: REGOV_EXT_SIGNATURE_NAMESPACE
  }, ({ t, i18n, close, credential: presentation }) => {
    const { handler } = useRegov()
    const credential = getSignatureRequestFromPresentation(presentation) as Credential
    const subject = getCompatibleSubject<SignatureRequestSubject>(credential)

    const wrapper = handler.wallet?.getRegistry(REGISTRY_TYPE_REQUESTS)
      .getCredential(presentation.id, REGISTRY_SECTION_OWN)

    const methods = useForm<SignatureRequestViewFields>({
      mode: 'onChange',
      criteriaMode: 'all',
      defaultValues: {
        signature: {
          request: { ...subject, name: wrapper?.meta.title }
        }
      }
    })

    const props = { t, i18n }

    return <Fragment>
      <DialogContent>
        <WalletFormProvider {...methods}>
          <PrimaryForm {...props} title="signature.request.view">
            {wrapper?.meta.title && wrapper?.meta.title !== ''
              && <MainTextOutput {...props} field="signature.request.name" showHint />}
            {subject.description && subject.description !== ''
              && <LongOutput {...props} field="signature.request.description" />}
            <MainTextOutput {...props} field="signature.request.documentHash" showHint />
            {subject.url && subject.url !== ''
              && <MainTextOutput {...props} field="signature.request.url" showHint />}
            {subject.authorId && subject.authorId !== ''
              && <MainTextOutput {...props} field="signature.request.authorId" showHint />}
            {subject.version && subject.version !== ''
              && <MainTextOutput {...props} field="signature.request.version" showHint />}
          </PrimaryForm>
        </WalletFormProvider>
      </DialogContent>
      <DialogActions>
        <CredentialActionGroup content={presentation} prettyOutput
          exportTitle={`${wrapper?.meta.title || subject.documentHash}.request`} />
        <Button onClick={close}>{`${t('signature.request.close')}`}</Button>
      </DialogActions>
    </Fragment>
  })

export type SignatureRequestViewParams = EmptyProps & {
  ext: Extension
  credential: Presentation
  close?: () => void
}

export type SignatureRequestViewProps = RegovComponentProps<SignatureRequestViewParams>

export type SignatureRequestViewFields = {
  signature: {
    request: SignatureRequestSubject & {
      name: string
    }
  }
}