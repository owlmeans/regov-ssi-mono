import { Button, DialogActions, DialogContent } from '@mui/material'
import { GroupSubject, MembershipSubject, RegovGroupExtension, REGOV_CREDENTIAL_TYPE_GROUP, REGOV_EXT_GROUP_NAMESPACE } from '@owlmeans/regov-ext-groups'
import { EmptyProps, RegovComponetProps, useRegov, withRegov } from '@owlmeans/regov-lib-react'
import { dateFormatter, MainTextOutput, PrimaryForm, WalletFormProvider, CredentialActionGroup } from '@owlmeans/regov-mold-wallet-web'
import { normalizeValue } from '@owlmeans/regov-ssi-common'
import { getCompatibleSubject, Presentation, Credential, REGISTRY_TYPE_CLAIMS, REGISTRY_SECTION_OWN } from '@owlmeans/regov-ssi-core'
import React, {
  Fragment, FunctionComponent
} from 'react'
import { useForm } from 'react-hook-form'


export const MembershipClaimView: FunctionComponent<ClaimViewParams> =
  withRegov<ClaimViewProps>({
    namespace: REGOV_EXT_GROUP_NAMESPACE
  }, ({ credential: presentation, t, i18n, close }) => {
    const subject = getCompatibleSubject<MembershipSubject>(presentation.verifiableCredential[0])
    const { handler } = useRegov()

    const group = normalizeValue(presentation.verifiableCredential[0].evidence).find(
      cred => cred?.type.includes(REGOV_CREDENTIAL_TYPE_GROUP)
    ) as Credential | undefined

    const groupSubject = group ? getCompatibleSubject<GroupSubject>(group) : undefined

    const methods = useForm<ClaimViewFields>({
      mode: 'onChange',
      criteriaMode: 'all',
      defaultValues: {
        membership: {
          group: groupSubject,
          claim: subject,
          claimView: subject
        }
      }
    })

    const _props = { t, i18n }

    const wrapper = handler.wallet?.getRegistry(REGISTRY_TYPE_CLAIMS)
      .getCredential(presentation.id, REGISTRY_SECTION_OWN)

    return <Fragment>
      <DialogContent>
        <WalletFormProvider {...methods}>
          <PrimaryForm {..._props} title="membership.claimView.title">
            {groupSubject && <MainTextOutput {..._props} field="membership.group.name" showHint />}
            <MainTextOutput {..._props} field="membership.claim.groupId" showHint />
            <MainTextOutput {..._props} field="membership.claimView.role" showHint />
            {subject.description !== ''
              && <MainTextOutput {..._props} field="membership.claim.description" showHint />}
            <MainTextOutput {..._props} field="membership.claim.createdAt" showHint formatter={dateFormatter} />
          </PrimaryForm>
        </WalletFormProvider>
      </DialogContent>
      <DialogActions>
        <CredentialActionGroup content={presentation} prettyOutput
          exportTitle={wrapper?.meta.title || subject.role} />
        <Button onClick={close}>{t('membership.claimView.close')}</Button>
      </DialogActions>
    </Fragment>
  })

export type ClaimViewParams = EmptyProps & {
  ext: RegovGroupExtension
  credential: Presentation
  close?: () => void
}

export type ClaimViewProps = RegovComponetProps<ClaimViewParams>


export type ClaimViewFields = {
  membership: {
    group: GroupSubject | undefined
    claim: MembershipSubject
    claimView: MembershipSubject
  }
}