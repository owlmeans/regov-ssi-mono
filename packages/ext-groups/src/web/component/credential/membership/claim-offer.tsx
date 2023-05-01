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

import {
  GroupSubject, MembershipSubject, BASIC_IDENTITY_TYPE, RegovGroupExtension, REGOV_EXT_GROUP_NAMESPACE,
  REGOV_CREDENTIAL_TYPE_MEMBERSHIP
} from '../../../../types'
import { getGroupFromMembershipOfferPresentation, getMembershipOffer } from '../../../../util'
import { EmptyProps, generalNameVlidation, RegovComponentProps, useRegov, withRegov } from '@owlmeans/regov-lib-react'
import {
  AlertOutput, dateFormatter, MainTextInput, MainTextOutput, PrimaryForm, WalletFormProvider
} from '@owlmeans/regov-lib-react'
import { normalizeValue, singleValue } from '@owlmeans/regov-ssi-core'
import {
  getCompatibleSubject, Presentation, Credential, REGISTRY_TYPE_CLAIMS, REGISTRY_TYPE_IDENTITIES
} from '@owlmeans/regov-ssi-core'
import { VALIDATION_KIND_OFFER } from '@owlmeans/regov-ssi-core'
import React, { Fragment, FunctionComponent, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { OfferFields } from './offer'

import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'


export const MembershipClaimOffer: FunctionComponent<ClaimOfferParams> = withRegov<ClaimOfferProps>(
  { namespace: REGOV_EXT_GROUP_NAMESPACE }, (props) => {
    const { credential: presentation, navigator, close, t, ext, i18n } = props
    const { handler, extensions } = useRegov()
    const [claim, setClaim] = useState<Presentation | undefined>(undefined)
    const group = getGroupFromMembershipOfferPresentation(presentation)
    const groupSubject = getCompatibleSubject<GroupSubject>(group as Credential)
    const membership = getMembershipOffer(presentation)
    const subject = getCompatibleSubject<MembershipSubject>(membership as Credential)

    const _props = {
      t, i18n, rules: {
        'membership.title': generalNameVlidation()
      }
    }

    useEffect(() => {
      setTimeout(async () => {
        const loader = await navigator?.invokeLoading()
        try {
          if (!handler.wallet || !extensions || !membership) {
            return
          }

          const factory = ext.getFactory(REGOV_CREDENTIAL_TYPE_MEMBERSHIP)
          const result = await factory.validate(handler.wallet, {
            presentation, credential: membership, extensions: extensions.registry,
            kind: VALIDATION_KIND_OFFER
          })

          if (!result.valid) {
            const cause = singleValue(result.cause)
            if (!cause) {
              throw 'unknwonValidationError'
            } else if (typeof cause === 'string') {
              throw cause
            } else {
              throw cause.kind
            }
          }

          const registry = handler.wallet.getRegistry(REGISTRY_TYPE_CLAIMS)
          const wrapper = registry.getCredential(presentation.id)

          const claim = wrapper?.credential as unknown as Presentation
          if (claim) {
            const hasIdentity = normalizeValue(membership?.evidence).find(evidence => {
              const cred = evidence as Credential
              if (cred.type.includes(BASIC_IDENTITY_TYPE)) {
                return !!handler.wallet?.getRegistry(REGISTRY_TYPE_IDENTITIES)
                  .getCredential(cred.id)
              }

              return false
            })
            if (!hasIdentity) {
              throw 'identityAlien'
            }
            setClaim(claim)
          } else {
            throw 'claimAlien'
          }
        } catch (error) {
          console.error(error)
          loader?.error(error.message || t(`membership.offer.alert.error.${error}`))
        } finally {
          loader?.finish()
        }
      }, 250)
    }, [presentation.id])

    const save = async (data: ClaimOfferFields) => {
      const loader = await navigator?.invokeLoading()
      try {
        if (!handler.wallet || !membership || !claim) {
          return
        }
        const registry = handler.wallet.getRegistry(REGISTRY_TYPE_IDENTITIES)

        const wrapper = await registry.addCredential(membership)
        wrapper.meta.title = data.membership.title

        handler.notify()

        if (claim.id) {
          handler.wallet.getRegistry(REGISTRY_TYPE_CLAIMS)
            .removeCredential(claim)
        }

        loader?.success(t('membership.message.claimed'))

        close && close()
      } catch (error) {
        loader?.error(error)
      } finally {
        loader?.finish()
      }
    }

    const methods = useForm<ClaimOfferFields>({
      mode: 'onChange',
      criteriaMode: 'all',
      defaultValues: {
        membership: {
          title: '',
          group: groupSubject,
          offer: subject
        }
      }
    })

    return <Fragment>
      <DialogContent>
        <WalletFormProvider {...methods}>
          <PrimaryForm {..._props} title="membership.offer.claim.title">
            {claim && <MainTextInput {..._props} field="membership.title" />}
            {groupSubject && <MainTextOutput {..._props} field="membership.group.name" showHint />}
            <MainTextOutput {..._props} field="membership.offer.groupId" showHint />
            <MainTextOutput {..._props} field="membership.offer.role" showHint />
            {subject.description !== '' &&
              <MainTextOutput {..._props} field="membership.offer.description" showHint />}
            <MainTextOutput {..._props} field="membership.offer.memberCode" showHint />
            <MainTextOutput {..._props} field="membership.offer.createdAt" showHint formatter={dateFormatter} />
            <AlertOutput {..._props} field="membership.offer.alert" />
          </PrimaryForm>
        </WalletFormProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>{`${t('membership.offer.close')}`}</Button>
        {claim && <Button onClick={methods.handleSubmit(save)}>{`${t('membership.offer.save')}`}</Button>}
      </DialogActions>
    </Fragment>
  })

export type ClaimOfferParams = EmptyProps & {
  ext: RegovGroupExtension
  credential: Presentation
  close?: () => void
}

export type ClaimOfferProps = RegovComponentProps<ClaimOfferParams>

export type ClaimOfferFields = OfferFields & {
  membership: {
    title: string
  }
}