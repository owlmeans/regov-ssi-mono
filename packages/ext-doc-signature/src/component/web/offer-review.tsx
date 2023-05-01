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

import React, { Fragment, FunctionComponent, PropsWithChildren, useEffect, useState } from "react"
import {
  AlertOutput, basicNavigator, EmptyProps, PrimaryForm, useNavigator, useRegov,
  WalletFormProvider
} from "@owlmeans/regov-lib-react"
import {
  ERROR_INVALID_SIGNATURE_TO_ACCEPT, REGOV_CREDENTIAL_TYPE_SIGNATURE,
  REGOV_EXT_SIGNATURE_NAMESPACE, SignaturePresentation
} from "../../types"
import { getSignatureCredentialOfferFromPresentation } from "../../util"
import { useTranslation } from "react-i18next"
import { SignatureViewFieldsWeb } from "./view/fields"

import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import { Button } from "@mui/material"
import { Extension, singleValue, VALIDATION_KIND_OFFER } from "@owlmeans/regov-ssi-core"
import { useInboxRegistry } from "@owlmeans/regov-ext-comm"
import { useForm } from "react-hook-form"


export const SignatureOfferReviewWeb: FunctionComponent<SignatureOfferReviewWebProps> = props => {
  const { handler, extensions } = useRegov()
  const cred = getSignatureCredentialOfferFromPresentation(props.offer)
  const inbox = useInboxRegistry()
  const { t, i18n } = useTranslation(props.ns || REGOV_EXT_SIGNATURE_NAMESPACE)
  const [valid, setValid] = useState<boolean>(false)
  const navigator = useNavigator(basicNavigator)

  const methods = useForm({
    mode: 'onChange',
    criteriaMode: 'all',
    defaultValues: { signature: { offerReview: { alert: '' } } }
  })

  useEffect(() => {
    (async () => {
      if (!handler.wallet || !extensions) {
        return
      }

      const factory = props.ext.getFactory(REGOV_CREDENTIAL_TYPE_SIGNATURE)
      const result = await factory.validate(handler.wallet, {
        extensions: extensions.registry, credential: cred,
        presentation: props.offer, kind: VALIDATION_KIND_OFFER
      })

      setValid(result.valid)

      if (!result.valid) {
        const cause = singleValue(result.cause)
        methods.setError('signature.offerReview.alert', {
          type: 'signature.offerInvalid',
          message: cause === undefined ? ''
            : typeof cause === 'string' ? cause
              : cause.message
        })
      }
    })()
  }, [props.offer.id])

  const accept = async () => {
    const loading = await navigator.invokeLoading()
    try {
      if (!valid) {
        throw ERROR_INVALID_SIGNATURE_TO_ACCEPT
      }

      const wrap = await handler.wallet?.getCredRegistry().addCredential(cred)

      if (wrap) {
        wrap.meta.title = cred.credentialSubject.name
      }

      await handler.wallet?.getClaimRegistry().removeCredential(props.offer)
      await inbox.removePeer(props.offer)

      handler.notify()

      props.close && props.close()
    } catch (e) {
      console.error(e)
      loading.error("message" in e ? e.message : e)
    } finally {
      loading.finish()
    }
  }

  const _props = { t, i18n }

  return <Fragment>
    <DialogContent>
      <WalletFormProvider {...methods}>
        <PrimaryForm {..._props} title="signature.offer-review.title">
          <AlertOutput {..._props} field="signature.offerReview.alert" />
        </PrimaryForm>
      </WalletFormProvider>
      <SignatureViewFieldsWeb t={t} cred={cred} />
    </DialogContent>
    <DialogActions>
      {valid && <Button onClick={accept}>{t('signature.offer.accept')}</Button>}
    </DialogActions>
  </Fragment>
}

export type SignatureOfferReviewWebProps = PropsWithChildren<EmptyProps & {
  offer: SignaturePresentation
  ext: Extension
  close?: () => void
}>