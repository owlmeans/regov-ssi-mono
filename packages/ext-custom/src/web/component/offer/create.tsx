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

import { DIDCommConnectMeta, getDIDCommUtils } from '@owlmeans/regov-comm'
import { useInboxRegistry } from '@owlmeans/regov-ext-comm'
import {
  AlertOutput, basicNavigator, CredentialSelector, FormMainAction, PrimaryForm, trySubmit, useNavigator, useRegov,
  WalletFormProvider
} from '@owlmeans/regov-lib-react'
import { addToValue, DIDDocument, Extension } from '@owlmeans/regov-ssi-core'
import React, { Fragment, FunctionComponent } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import Grid from '@mui/material/Grid'
import DialogContent from '@mui/material/DialogContent'

import { DefaultCredential, DefaultDescription, DefaultPresentation, DefaultSubject, UseFieldAt } from '../../../custom.types'
import { buildForm, castIssuerField } from '../helper/form'
import { FieldsRenderer } from '../widget/fields'
import { getCredential, getSubject } from '../../utils/cred'
import { InputsRenderer } from '../widget/inputs'
import { castSectionKey } from '../../utils/tools'
import { ERROR_NO_IDENTITY, ERROR_WIDGET_AUTHENTICATION } from '../../ui.types'
import DialogActions from '@mui/material/DialogActions'


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
    }
  )

  const offer = trySubmit<OfferFields>(
    { navigator, methods, errorField: `${sectionKey}.alert`, onError: async () => true },
    async (_, data) => {
      if (!handler.wallet) {
        throw new Error(ERROR_WIDGET_AUTHENTICATION)
      }

      const unsigned: DefaultCredential = JSON.parse(JSON.stringify(credential))
      const identity = handler.wallet.getIdentityCredential(data[sectionKey].issuer)

      if (!identity) {
        throw new Error(ERROR_NO_IDENTITY)
      }

      const factory = ext.getFactory(descr.mainType)
      unsigned.evidence = addToValue(unsigned.evidence, identity)

      const offer = await factory.offer(handler.wallet, {
        claim, credential: unsigned,
        holder: unsigned.issuer as DIDDocument,
        cryptoKey: await handler.wallet.keys.getCryptoKey(),
        subject: { ...unsigned.credentialSubject, ...data[sectionKey].offer_create },
        id: claim.id as string,
        challenge: claim.proof.challenge || '',
        domain: claim.proof.domain || ''
      })

      if (conn) {
        await getDIDCommUtils(handler.wallet).send(conn, offer)
        await inboxRegistry.removePeer(claim)
        handler.notify()
      }

      close && close()
    }
  )

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
      <FormMainAction {...fields} title={`${sectionKey}.action.offer`} action={methods.handleSubmit(offer)} />
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

type OfferFields = {
  [key: string]: {
    alert: string,
    issuer: string,
    offer_create: DefaultSubject
  }
}
