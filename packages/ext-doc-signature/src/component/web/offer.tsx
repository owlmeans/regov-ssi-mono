import React, { Fragment, FunctionComponent, PropsWithChildren, useEffect, useState } from "react"

import {
  basicNavigator, EmptyProps, generalDidIdValidation, generalIdVlidation, generalNameVlidation,
  humanReadableVersion, PrimaryForm, trySubmit, urlVlidation, useNavigator, useRegov, WalletFormProvider
} from "@owlmeans/regov-lib-react"
import { SignaturePresentation } from "../../types"
import { useTranslation } from "react-i18next"
import { getSignatureCredentialClaimFromPresentation } from "../../util"
import { SignatureCreationFields } from "./creation"
import { useForm } from "react-hook-form"
import { SignatureCreationFieldsWeb } from "./creation/fields"

import DialogContent from '@mui/material/DialogContent'
import DialogActions from "@mui/material/DialogActions"
import Button from "@mui/material/Button"
import { DIDCommConnectMeta } from "@owlmeans/regov-comm"


export const SignatureOfferWeb: FunctionComponent<SignatureOfferWebProps> = props => {
  const { claim } = props
  const navigator = useNavigator(basicNavigator)
  const { t, i18n } = useTranslation(props.ns)
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

  const [defaultId, setDefaultId] = useState<string | undefined>(undefined)

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
  }, async () => {
  })

  return <Fragment>
    <DialogContent>
      <WalletFormProvider {...methods}>
        <PrimaryForm {...fieldProps} title="signature.offer.title">
          <SignatureCreationFieldsWeb fieldProps={fieldProps} selectorProps={{
            ...fieldProps, credentials: identities, defaultId
          }} signatureField="signature.offer.identity" />
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
}>

export type SignatureOfferFields = SignatureCreationFields & {
  signature: { offer: { identity: string } }
}