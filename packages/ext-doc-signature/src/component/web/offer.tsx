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

import React, { Fragment, FunctionComponent, PropsWithChildren, useEffect, useState } from "react"

import {
  basicNavigator, EmptyProps, generalDidIdValidation, generalIdVlidation, generalNameVlidation,
  humanReadableVersion, PrimaryForm, trySubmit, urlVlidation, useNavigator, useRegov, WalletFormProvider
} from "@owlmeans/regov-lib-react"
import {
  ERROR_WIDGET_AUTHENTICATION, REGOV_CREDENTIAL_TYPE_SIGNATURE, REGOV_EXT_SIGNATURE_NAMESPACE,
  SignatureCredential, SignaturePresentation
} from "../../types"
import { useTranslation } from "react-i18next"
import { getSignatureCredentialClaimFromPresentation } from "../../util"
import { SignatureCreationFields } from "./creation"
import { FieldValues, useForm, UseFormReturn } from 'react-hook-form'
import { SignatureCreationFieldsWeb } from './creation/fields'
import { useInboxRegistry } from '@owlmeans/regov-ext-comm'

import DialogContent from '@mui/material/DialogContent'
import DialogActions from "@mui/material/DialogActions"
import Button from "@mui/material/Button"
import { DIDCommConnectMeta, getDIDCommUtils } from "@owlmeans/regov-comm"
import { addToValue, DIDDocument, ERROR_NO_IDENTITY, Extension } from "@owlmeans/regov-ssi-core"
import { isCreationMetaFields } from "./creation/types"


export const SignatureOfferWeb: FunctionComponent<SignatureOfferWebProps> = props => {
  const { claim, ext, conn } = props
  const navigator = useNavigator(basicNavigator)
  const inboxRegistry = useInboxRegistry()
  const { t, i18n } = useTranslation(props.ns || REGOV_EXT_SIGNATURE_NAMESPACE)
  const { handler } = useRegov()

  const cred = getSignatureCredentialClaimFromPresentation(claim)

  const methods = useForm<SignatureOfferFields>({
    mode: 'onChange',
    criteriaMode: 'all',
    defaultValues: { signature: { creation: { ...cred?.credentialSubject } } }
  })

  const fieldProps = {
    t, i18n,
    rules: {
      'signature.creation.name': generalNameVlidation(true),
      'signature.creation.author': generalNameVlidation(false),
      'signature.creation.authorId': generalIdVlidation(false),
      'signature.creation.url': urlVlidation(),
      'signature.creation.version': humanReadableVersion,
      'signature.claim.issuerDid': generalDidIdValidation()
    }
  }

  const identities = handler.wallet?.getIdentityWrappers() || []

  const [defaultId, setDefaultId] = useState<string | undefined>(props.conn.sender.id)

  useEffect(() => {
    const id = handler.wallet?.getIdentity()?.credential.id
    if (id) {
      setDefaultId(id)
    } else {
      methods.setError('signature.creation.alert', { type: 'noIdentity' })
    }
  }, [identities.length])

  const offer = trySubmit<SignatureOfferFields>({
    navigator, methods, errorField: 'signature.creation.alert'
  }, async (_, data) => {
    if (!handler.wallet) {
      throw ERROR_WIDGET_AUTHENTICATION
    }

    const unsigned: SignatureCredential = JSON.parse(JSON.stringify(cred))
    const identity = handler.wallet.getIdentityCredential(data.signature.offer.identity)

    if (!identity) {
      throw ERROR_NO_IDENTITY
    }

    const factory = ext.getFactory(REGOV_CREDENTIAL_TYPE_SIGNATURE)
    unsigned.evidence = addToValue(unsigned.evidence, identity)

    const offer = await factory.offer(handler.wallet, {
      claim, credential: unsigned,
      holder: unsigned.issuer as DIDDocument,
      cryptoKey: await handler.wallet.keys.getCryptoKey(),
      subject: {
        ...unsigned.credentialSubject, ...Object.fromEntries(
          Object.entries(data.signature.creation).filter(
            ([key]) => !isCreationMetaFields(key)
          )
        )
      },
      id: claim.id as string,
      challenge: claim.proof.challenge || '',
      domain: claim.proof.domain || ''
    })

    await getDIDCommUtils(handler.wallet).send(conn, offer)

    await inboxRegistry.removePeer(claim)

    handler.notify()

    props.close && props.close()
  })

  return <Fragment>
    <DialogContent>
      <WalletFormProvider {...methods}>
        <PrimaryForm {...fieldProps} title="signature.offer.title">
          <SignatureCreationFieldsWeb fieldProps={fieldProps} selectorProps={{
            ...fieldProps, credentials: identities, defaultId
          }} signatureField="signature.offer.identity"
            methods={methods as unknown as UseFormReturn<FieldValues>} />
        </PrimaryForm>
      </WalletFormProvider>
    </DialogContent>
    <DialogActions>
      <Button onClick={methods.handleSubmit(offer)}>{t('signature.offer.send')}</Button>
    </DialogActions>
  </Fragment>
}

export type SignatureOfferWebProps = PropsWithChildren<EmptyProps & {
  close?: () => void
  claim: SignaturePresentation
  conn: DIDCommConnectMeta
  ext: Extension
}>

export type SignatureOfferFields = SignatureCreationFields & {
  signature: { offer: { identity: string } }
}