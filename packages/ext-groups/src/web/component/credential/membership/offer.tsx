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

import {
  GroupSubject, MembershipSubject, RegovGroupExtension, REGOV_CLAIM_TYPE,
  REGOV_CREDENTIAL_TYPE_MEMBERSHIP, REGOV_EXT_GROUP_NAMESPACE, REGOV_OFFER_TYPE
} from '../../../../types'
import {
  getGroupFromMembershipClaimPresentation, getMembershipClaim, getMembershipClaimHolder,
} from '../../../../util'
import { EmptyProps, generalNameVlidation, RegovComponentProps, useRegov, withRegov } from '@owlmeans/regov-lib-react'
import React, { Fragment, FunctionComponent, useEffect, useState } from 'react'
import { getCompatibleSubject, Presentation, Credential } from '@owlmeans/regov-ssi-core'
import { Button, DialogActions, DialogContent } from '@mui/material'
import {
  AlertOutput, CredentialActionGroup, dateFormatter, LongTextInput, MainTextInput, MainTextOutput,
  PrimaryForm, WalletFormProvider
} from '@owlmeans/regov-lib-react'
import { useForm } from 'react-hook-form'
import { ERROR_MEMBERSHIP_READYTO_CLAIM, ERROR_WIDGET_AUTHENTICATION } from '../../types'
import { EXTENSION_TRIGGER_RETRIEVE_NAME, RetreiveNameEventParams } from '@owlmeans/regov-ssi-core'
import { singleValue } from '@owlmeans/regov-ssi-core'


export const MembershipOffer: FunctionComponent<MembershipOfferParams> = withRegov<MembershipOfferProps>(
  { namespace: REGOV_EXT_GROUP_NAMESPACE }, (props) => {
    const { credential: presentation, navigator, ext, close, t, i18n } = props
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

        const factory = ext.getFactory(REGOV_CREDENTIAL_TYPE_MEMBERSHIP)
        const offer = await factory.offer(handler.wallet, {
          claim: presentation,
          credential: getMembershipClaim(presentation) as Credential,
          holder: getMembershipClaimHolder(presentation),
          cryptoKey: await handler.wallet.keys.getCryptoKey(),
          claimType: REGOV_CLAIM_TYPE,
          offerType: REGOV_OFFER_TYPE,
          subject,
          id: presentation.id as string,
          challenge: presentation.proof.challenge,
          domain: presentation.proof.domain
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
      (async () => {
        if (!handler.wallet || !extensions) {
          return
        }
        const factory = ext.getFactory(REGOV_CREDENTIAL_TYPE_MEMBERSHIP)
        const result = await factory.validate(handler.wallet, {
          presentation, credential, extensions: extensions.registry
        })
        if (!result.valid) {
          const cause = singleValue(result.cause)
          if (!cause) {
            methods.setError('membership.offer.alert', { type: 'unknwonValidationError' })
          } else if (typeof cause === 'string') {
            methods.setError('membership.offer.alert', { type: cause })
          } else {
            methods.setError('membership.offer.alert', {
              type: cause.kind, message: cause.message
            })
          }
          return
        }
      })()
    }, [presentation.id])

    useEffect(() => {
      if (!handler.wallet || !extensions || !offer) {
        return
      }

      const credential = offer.verifiableCredential[0]
      extensions.triggerEvent<RetreiveNameEventParams>(
        handler.wallet, EXTENSION_TRIGGER_RETRIEVE_NAME, {
        credential, setName: (name: string) => { setName(name) }
      })
    }, [offer?.id])

    const _props = {
      i18n, t, rules: {
        "membership.offer.role": generalNameVlidation(),
        "membership.offer.memberCode": generalNameVlidation()
      }
    }

    return <Fragment>
      {!offer
        ? <Fragment>
          <DialogContent>
            <WalletFormProvider {...methods}>
              <PrimaryForm {..._props} title="membership.offer.title">
                {groupSubject && <MainTextOutput {..._props} field="membership.group.name" showHint />}
                <MainTextOutput {..._props} field="membership.offer.groupId" showHint />
                <MainTextInput {..._props} field="membership.offer.role" />
                <LongTextInput {..._props} field="membership.offer.description" />
                <MainTextInput {..._props} field="membership.offer.memberCode" />
                <MainTextOutput {..._props} field="membership.offer.createdAt" showHint formatter={dateFormatter} />
                <AlertOutput {..._props} field="membership.offer.alert" />
              </PrimaryForm>
            </WalletFormProvider>
          </DialogContent>
          <DialogActions>
            <Button onClick={methods.handleSubmit(proceed)}>{t('membership.offer.proceed')}</Button>
            <Button onClick={close}>{t('membership.offer.close')}</Button>
          </DialogActions>
        </Fragment>
        : <Fragment>
          <DialogContent>
            <WalletFormProvider {...methods}>
              <PrimaryForm {...props} title="membership.offer.title">
                {groupSubject && <MainTextOutput {...props} field="membership.group.name" showHint />}
                <MainTextOutput {...props} field="membership.offer.groupId" showHint />
                <MainTextOutput {...props} field="membership.offer.role" showHint />
                {subject.description !== ''
                  && <MainTextOutput {...props} field="membership.offer.description" showHint />}
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

export type MembershipOfferProps = RegovComponentProps<MembershipOfferParams>

export type OfferFields = {
  membership: {
    group: GroupSubject | undefined
    offer: MembershipSubject & { alert: string }
  }
}