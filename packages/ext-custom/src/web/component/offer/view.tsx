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
import { Extension, normalizeValue } from '@owlmeans/regov-ssi-core'
import { Fragment, FunctionComponent } from 'react'
import { DefaultDescription, DefaultPresentation, DEFAULT_SUFFIX_REFUSE, REFUSED_TITLE, UseFieldAt } from "../../../custom.types"

import { useForm } from 'react-hook-form'
import { produceValidation } from '../helper/form'
import { castSectionKey } from '../../utils/tools'
import { useTranslation } from 'react-i18next'
import { AlertOutput, basicNavigator, FormMainAction, MainTextInput, PrimaryForm, useNavigator, useRegov, WalletFormProvider } from '@owlmeans/regov-lib-react'

import { FieldsRenderer } from '../widget/fields'
import { getSubject } from '../../utils/cred'

import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Grid from '@mui/material/Grid'
import { useInboxRegistry } from '@owlmeans/regov-ext-comm'
import { buildAccept, buildCancel } from './helpers'


export const OfferView: FunctionComponent<OfferViewProps> =
  ({ descr, offer, ext, close }) => {
    const { handler, extensions } = useRegov()
    const inbox = useInboxRegistry()
    const navigator = useNavigator(basicNavigator)
    const { t, i18n } = useTranslation(descr.ns)
    const sectionKey = castSectionKey(descr)
    const purpose = UseFieldAt.OFFER_VIEW

    const methods = useForm({
      mode: 'onChange',
      criteriaMode: 'all',
      defaultValues: {
        [sectionKey]: {
          meta_title: t(`${sectionKey}.${purpose}.meta_title.default`),
          alert: ''
        }
      }
    })

    const isRefused = normalizeValue(offer.type).some(type => type.includes(DEFAULT_SUFFIX_REFUSE))

    const fields = {
      t, i18n, title: `${sectionKey}.form.${isRefused ? REFUSED_TITLE : purpose}.title`,
      rules: produceValidation(purpose, descr)
    }

    const accept = buildAccept({
      navigator, methods, handler, descr, extensions, sectionKey, offer, purpose, ext, inbox, close
    })

    const cancel = buildCancel({
      navigator, methods, handler, sectionKey, offer, inbox, close
    })

    return <Fragment>
      <DialogContent>
        <WalletFormProvider {...methods}>
          <Grid container direction="column" spacing={1} justifyContent="flex-start" alignItems="stretch">
            <Grid item>
              <PrimaryForm {...fields}>
                {isRefused ? undefined : <MainTextInput {...fields} field={`${sectionKey}.meta_title`} />}
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
        {isRefused
          ? <FormMainAction {...fields} title={`${sectionKey}.action.cancel`} action={methods.handleSubmit(cancel)} />
          : <FormMainAction {...fields} title={`${sectionKey}.action.accept`} action={methods.handleSubmit(accept)} />}
      </DialogActions>
    </Fragment>
  }

export type OfferViewProps = {
  descr: DefaultDescription
  offer: DefaultPresentation
  ext: Extension
  conn?: DIDCommConnectMeta
  close?: () => void
}

export type AccpetFields = {
  [key: string]: {
    alert: string
    meta_title: string
  }
}
