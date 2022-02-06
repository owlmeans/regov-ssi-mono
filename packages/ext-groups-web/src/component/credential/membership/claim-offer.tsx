import { DialogContent } from '@mui/material'
import {
  getGroupFromMembershipOfferPresentation, getMembershipOffer, GroupSubject, MembershipSubject,
  BASIC_IDENTITY_TYPE, RegovGroupExtension, REGOV_EXT_GROUP_NAMESPACE
} from '@owlmeans/regov-ext-groups'
import { EmptyProps, RegovComponetProps, useRegov, withRegov } from '@owlmeans/regov-lib-react'
import { dateFormatter, MainTextOutput, PrimaryForm, WalletFormProvider } from '@owlmeans/regov-mold-wallet-web'
import { normalizeValue } from '@owlmeans/regov-ssi-common'
import { getCompatibleSubject, Presentation, Credential, REGISTRY_TYPE_CLAIMS, REGISTRY_TYPE_IDENTITIES, buildWalletLoader } from '@owlmeans/regov-ssi-core'
import React, { Fragment, FunctionComponent, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { OfferFields } from './offer'


export const MembershipClaimOffer: FunctionComponent<ClaimOfferParams> = withRegov<ClaimOfferProps>(
  { namespace: REGOV_EXT_GROUP_NAMESPACE }, (props) => {
    const { credential: presentation } = props
    const { handler } = useRegov()
    const [claim, setClaim] = useState<Presentation | undefined>(undefined)
    const group = getGroupFromMembershipOfferPresentation(presentation)
    const groupSubject = getCompatibleSubject<GroupSubject>(group as Credential)
    const membership = getMembershipOffer(presentation)
    const subject = getCompatibleSubject<MembershipSubject>(membership as Credential)

    useEffect(() => {
      (async () => {
        if (!handler.wallet) {
          return
        }

        try {
          const [isValid, result] = await handler.wallet.ssi.verifyPresentation(presentation, undefined, {
            testEvidence: true,
            nonStrictEvidence: true,
            localLoader: handler.wallet ? buildWalletLoader(handler.wallet) : undefined
          })

          if (!isValid) {
            console.log(result)
            return
          }
        } catch (error) {
          console.error(error)
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
            return
          }
          setClaim(claim)
        }
      })()
    }, [claim?.id])

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

    return <Fragment>
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
    </Fragment>
  })

export type ClaimOfferParams = EmptyProps & {
  ext: RegovGroupExtension
  credential: Presentation
  close?: () => void
}

export type ClaimOfferProps = RegovComponetProps<ClaimOfferParams>