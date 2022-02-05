import {
  getGroupFromMembershipClaimPresentation, getMembershipClaim, getMembershipClaimHolder,
  GroupSubject, MembershipSubject, RegovGroupExtension, REGOV_CREDENTIAL_TYPE_MEMBERSHIP,
  REGOV_EXT_GROUP_NAMESPACE
} from '@owlmeans/regov-ext-groups'
import { EmptyProps, RegovComponetProps, useRegov, withRegov } from '@owlmeans/regov-lib-react'
import React, { Fragment, FunctionComponent, useEffect, useState } from 'react'
import { getCompatibleSubject, Presentation, Credential } from '@owlmeans/regov-ssi-core'
import { Button, DialogActions, DialogContent } from '@mui/material'
import {
  AlertOutput, CredentialActionGroup, dateFormatter, LongTextInput, MainTextInput, MainTextOutput,
  PrimaryForm, WalletFormProvider
} from '@owlmeans/regov-mold-wallet-web'
import { useForm } from 'react-hook-form'
import { ERROR_MEMBERSHIP_READYTO_CLAIM, ERROR_WIDGET_AUTHENTICATION } from '../../types'
import { EXTENSION_TRIGGER_RETRIEVE_NAME, RetreiveNameEventParams } from '@owlmeans/regov-ssi-extension'


export const MembershipOffer: FunctionComponent<MembershipOfferParams> = withRegov<MembershipOfferProps>({
  namespace: REGOV_EXT_GROUP_NAMESPACE
}, (props) => {
  const { credential: presentation, navigator, ext, close, t } = props
  const { handler, extensions } = useRegov()

  const group = getGroupFromMembershipClaimPresentation(presentation) as Credential
  const credential = presentation.verifiableCredential[0]
  const groupSubject = getCompatibleSubject<GroupSubject>(group)
  const subject = getCompatibleSubject<MembershipSubject>(credential)
  const [offer, setOffer] = useState<Presentation | undefined>(undefined)
  const [name, setName] = useState('')

  const methods = useForm<OfferFields>({
    mode: 'onChange',
    criteriaMode: 'all',
    defaultValues: {
      membership: {
        group: groupSubject,
        offer: subject
      }
    }
  })

  const proceed = async (data: OfferFields) => {
    const loader = await navigator?.invokeLoading()
    try {
      if (!handler.wallet) {
        throw ERROR_WIDGET_AUTHENTICATION
      }
      if (!ext) {
        throw ERROR_MEMBERSHIP_READYTO_CLAIM
      }

      const subject = data.membership.offer as any
      delete subject.alert

      console.log(subject)

      const factory = ext.getFactory(REGOV_CREDENTIAL_TYPE_MEMBERSHIP)
      const offer = await factory.offeringFactory(handler.wallet, {
        claim: getMembershipClaim(presentation) as Credential,
        holder: getMembershipClaimHolder(presentation),
        cryptoKey: await handler.wallet.keys.getCryptoKey(),
        subject
      })

      setOffer(offer)
    } catch (error) {
      console.error(error)
      loader?.error(error)
      if (error.message) {
        methods.setError('membership.offer.alert', { type: error.message })
        return
      }
    } finally {
      loader?.finish()
    }
  }

  useEffect(() => {
    if (!handler.wallet || !extensions || !offer) {
      return
    }
    const credential = offer.verifiableCredential[0]
    extensions.triggerEvent<RetreiveNameEventParams<string>>(
      handler.wallet, EXTENSION_TRIGGER_RETRIEVE_NAME, {
      credential, setName: (name: string) => { setName(name) }
    })
  }, [offer?.id])

  return <Fragment>
    {!offer && <Fragment>
      <DialogContent>
        <WalletFormProvider {...methods}>
          <PrimaryForm {...props} title="membership.offer.title">
            {groupSubject && <MainTextOutput {...props} field="membership.group.name" showHint />}
            <MainTextOutput {...props} field="membership.offer.groupId" showHint />
            <MainTextInput {...props} field="membership.offer.role" />
            <LongTextInput {...props} field="membership.offer.description" />
            <MainTextInput {...props} field="membership.offer.memberCode" />
            <MainTextOutput {...props} field="membership.offer.createdAt" showHint formatter={dateFormatter} />
            <AlertOutput {...props} field="membership.offer.alert" />
          </PrimaryForm>
        </WalletFormProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={methods.handleSubmit(proceed)}>{t('membership.offer.proceed')}</Button>
        <Button onClick={close}>{t('membership.offer.close')}</Button>
      </DialogActions>
    </Fragment>}
    {offer && <Fragment>
      <DialogContent>
        <WalletFormProvider {...methods}>
          <PrimaryForm {...props} title="membership.offer.title">
            {groupSubject && <MainTextOutput {...props} field="membership.group.name" showHint />}
            <MainTextOutput {...props} field="membership.offer.groupId" showHint />
            <MainTextOutput {...props} field="membership.offer.role" showHint />
            <MainTextOutput {...props} field="membership.offer.description" showHint />
            <MainTextOutput {...props} field="membership.offer.memberCode" showHint />
            <MainTextOutput {...props} field="membership.offer.createdAt" showHint formatter={dateFormatter} />
          </PrimaryForm>
        </WalletFormProvider>
      </DialogContent>
      <DialogActions>
        <CredentialActionGroup prettyOutput content={offer} exportTitle={name} />
        <Button onClick={close}>{t('membership.offer.close')}</Button>
      </DialogActions>
    </Fragment>}
  </Fragment>
})

export type MembershipOfferParams = EmptyProps & {
  ext: RegovGroupExtension
  credential: Presentation
  close?: () => void
}

export type MembershipOfferProps = RegovComponetProps<MembershipOfferParams>

export type OfferFields = {
  membership: {
    group: GroupSubject | undefined
    offer: MembershipSubject & {
      alert: string
    }
  }
}