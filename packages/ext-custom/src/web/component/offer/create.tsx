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

import { DIDCommConnectMeta } from '@owlmeans/regov-comm'
import { useInboxRegistry } from '@owlmeans/regov-ext-comm'
import { AlertOutput, basicNavigator, CredentialSelector, FormMainButton, PrimaryForm, useNavigator, useRegov, WalletFormProvider } from '@owlmeans/regov-lib-react'
import { Extension } from '@owlmeans/regov-ssi-core'
import React, { Fragment, FunctionComponent } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import Grid from '@mui/material/Grid'
import DialogContent from '@mui/material/DialogContent'

import { DefaultDescription, DefaultPresentation, DefaultSubject, UseFieldAt } from '../../../custom.types'
import { buildForm, castIssuerField } from '../helper/form'
import { FieldsRenderer } from '../widget/fields'
import { getCredential, getSubject } from '../../utils/cred'
import { InputsRenderer } from '../widget/inputs'
import { castSectionKey } from '../../utils/tools'
import DialogActions from '@mui/material/DialogActions'
import { buildOffer, buildRefuse } from './helpers'


export const OfferCreate: FunctionComponent<OfferCreateProps> = ({ descr, claim, conn, ext, close }) => {
  const { handler } = useRegov()
  const navigator = useNavigator(basicNavigator)
  const inboxRegistry = useInboxRegistry()
  const credential = getCredential(descr, claim)

  const identities = handler.wallet?.getIdentityWrappers()
  const defaultId = handler.wallet?.getIdentityCredential()?.id || ''
  const sectionKey = castSectionKey(descr)

  const [methods, fields] = buildForm(
    UseFieldAt.OFFER_CREATE, descr, defaultId, useForm, useTranslation, {
    controllerField: 'issuer',
    values: getSubject(descr, claim)
  })

  const offer = buildOffer({
    navigator, methods, handler, credential, sectionKey, ext, claim, conn, descr, inboxRegistry, close
  })

  const refuse = buildRefuse({
    navigator, methods, handler, credential, sectionKey, ext, claim, conn, descr, inboxRegistry, close
  })

  return <Fragment>
    <DialogContent>
      <WalletFormProvider {...methods}>
        <Grid container direction="column" spacing={1} justifyContent="flex-start" alignItems="stretch">
          <Grid item>
            <FieldsRenderer purpose={UseFieldAt.CLAIM_VIEW} descr={descr} subject={getSubject(descr, claim)} />
          </Grid>
          <Grid item>
            <PrimaryForm {...fields}>
              {identities && <CredentialSelector {...fields} credentials={identities} defaultId={defaultId} field={castIssuerField(descr)} />}
              <InputsRenderer purpose={UseFieldAt.OFFER_CREATE} descr={descr} props={fields} />
              <AlertOutput {...fields} field={`${sectionKey}.alert`} />
            </PrimaryForm>
          </Grid>
        </Grid>
      </WalletFormProvider>
    </DialogContent>
    <DialogActions>
      <Grid container item direction="row" justifyContent="flex-end" alignItems="center" spacing={1}>
        <Grid item xs={3}>
          <FormMainButton {...fields} title={`${sectionKey}.action.refuse`} action={methods.handleSubmit(refuse)} />
        </Grid>
        <Grid item xs={3}>
          <FormMainButton {...fields} title={`${sectionKey}.action.offer`} action={methods.handleSubmit(offer)} />
        </Grid>
      </Grid>
    </DialogActions>
  </Fragment>
}

export type OfferCreateProps = {
  descr: DefaultDescription
  claim: DefaultPresentation
  ext: Extension
  conn?: DIDCommConnectMeta
  close?: () => void
}

export type OfferFields = {
  [key: string]: {
    alert: string,
    issuer: string,
    offer_create: DefaultSubject
  }
}
