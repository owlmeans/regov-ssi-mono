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
import { Extension, singleValue, VALIDATION_KIND_OFFER } from '@owlmeans/regov-ssi-core'
import React, { Fragment, FunctionComponent } from 'react'
import { DefaultDescription, DefaultPresentation, UseFieldAt } from "../../../custom.types"

import { useForm } from 'react-hook-form'
import { produceValidation } from '../helper/form'
import { castSectionKey } from '../../utils/tools'
import { useTranslation } from 'react-i18next'
import {
  AlertOutput, basicNavigator, FormMainAction, MainTextInput, PrimaryForm, trySubmit, useNavigator, useRegov,
  WalletFormProvider
} from '@owlmeans/regov-lib-react'

import { FieldsRenderer } from '../widget/fields'
import { getCredential, getSubject } from '../../utils/cred'

import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Grid from '@mui/material/Grid'
import { ERROR_OFFER_WITHOUT_CRED, ERROR_WIDGET_AUTHENTICATION } from '../../ui.types'
import { useInboxRegistry } from '@owlmeans/regov-ext-comm'


export const OfferReview: FunctionComponent<OfferReviewProps> =
  ({ descr, offer, ext, close }) => {
    const { handler, extensions } = useRegov()
    const inbox = useInboxRegistry()
    const navigator = useNavigator(basicNavigator)
    const { t, i18n } = useTranslation(descr.ns)
    const sectionKey = castSectionKey(descr)
    const purpose = UseFieldAt.OFFER_REVIEW

    const methods = useForm({
      mode: 'onChange',
      criteriaMode: 'all',
      defaultValues: {
        [sectionKey]: {
          meta_title: t(`${sectionKey}.${purpose}.title.default`),
          alert: ''
        }
      }
    })

    const fields = {
      t, i18n, title: `${sectionKey}.form.${purpose}.title`,
      rules: produceValidation(purpose, descr)
    }

    const accept = trySubmit<OfferFields>(
      { navigator, methods, errorField: `${sectionKey}.alert`, onError: async () => true },
      async (_, data) => {
        if (!handler.wallet || !extensions) {
          throw new Error(ERROR_WIDGET_AUTHENTICATION)
        }

        const credential = getCredential(descr, offer)
        if (!credential) {
          throw new Error(ERROR_OFFER_WITHOUT_CRED)
        }
        const factory = ext.getFactory(descr.mainType)
        const offerCheckResult = await factory.validate(handler.wallet, {
          extensions: extensions.registry, presentation: offer,
          credential, kind: VALIDATION_KIND_OFFER
        })

        if (!offerCheckResult.valid) {
          const cause = singleValue(offerCheckResult.cause)
          const causeMsg = typeof cause === 'string' ? cause : cause?.message
          throw new Error(causeMsg || `${sectionKey}.${purpose}.error.unknown`)
        }

        const wrap = await handler.wallet.getCredRegistry().addCredential(credential)
        wrap.meta.title = data[sectionKey].meta_title

        await handler.wallet.getClaimRegistry().removeCredential(offer)
        await inbox.removePeer(offer)

        handler.notify()

        close && close()
      }
    )

    return <Fragment>
      <DialogContent>
        <WalletFormProvider {...methods}>
          <Grid container direction="column" spacing={1} justifyContent="flex-start" alignItems="stretch">
            <Grid item>
              <PrimaryForm {...fields}>
                <MainTextInput {...fields} field={`${sectionKey}.meta_title`} />
                <AlertOutput {...fields} field={`${sectionKey}.alert`} />
              </PrimaryForm>
            </Grid>
            <Grid item>
              <FieldsRenderer purpose={purpose} descr={descr} subject={getSubject(descr, offer)} />
            </Grid>
          </Grid>
        </WalletFormProvider>
      </DialogContent>
      <DialogActions>
        <FormMainAction {...fields} title={`${sectionKey}.action.accept`} action={methods.handleSubmit(accept)} />
      </DialogActions>
    </Fragment>
  }

export type OfferReviewProps = {
  descr: DefaultDescription
  offer: DefaultPresentation
  ext: Extension
  conn?: DIDCommConnectMeta
  close?: () => void
}

type OfferFields = {
  [key: string]: {
    alert: string
    meta_title: string
  }
}