import React, {
  Fragment,
  FunctionComponent,
  useEffect,
  useState
} from 'react'

import {
  Credential,
  getCompatibleSubject,
  UnsignedCredential
} from '@owlmeans/regov-ssi-core'
import {
  EmptyProps,
  RegovComponetProps,
  useRegov,
  withRegov
} from '@owlmeans/regov-lib-react'
import {
  RegovGroupExtension,
  REGOV_EXT_GROUP_NAMESPACE,
  MembershipSubject,
  GroupSubject,
  REGOV_CREDENTIAL_TYPE_MEMBERSHIP
} from '@owlmeans/regov-ext-groups'
import {
  DialogContent
} from '@mui/material'
import {
  dateFormatter,
  FormMainAction,
  MainTextInput,
  MainTextOutput,
  PrimaryForm,
  WalletFormProvider
} from '@owlmeans/regov-mold-wallet-web'
import { useForm } from 'react-hook-form'
import {
  ERROR_WIDGET_AUTHENTICATION,
  ERROR_WIDGET_EXTENSION
} from '../../types'


export const MembershipClaim: FunctionComponent<MembershipClaimParams> = withRegov<MembershipClaimProps>({
  namespace: REGOV_EXT_GROUP_NAMESPACE
}, (props) => {
  const { group, t, i18n, navigator, ext } = props
  const { handler } = useRegov()
  const groupSubjet = group ? getCompatibleSubject<GroupSubject>(group) : undefined
  const [unsignedMemberhips, setUnsignedMembership] = useState<UnsignedCredential | undefined>(undefined)

  const methods = useForm<MembershipClaimFields>({
    mode: 'onChange',
    criteriaMode: 'all',
    defaultValues: {
      membership: {
        group: groupSubjet,
        claim: {
          groupId: group ? group.id : '',
          role: '',
          memberCode: '',
          description: '',
          createdAt: ''
        }
      }
    }
  })

  useEffect(() => {
    (async () => {
      const loader = await navigator?.invokeLoading()
      try {
        if (!handler.wallet) {
          throw ERROR_WIDGET_AUTHENTICATION
        }
        if (!ext) {
          throw ERROR_WIDGET_EXTENSION
        }
        const factory = ext.getFactory(REGOV_CREDENTIAL_TYPE_MEMBERSHIP)
        const unsignedMemberhips = await factory.buildingFactory(handler.wallet, {
          subjectData: {
            groupId: group ? group.id : ''
          }
        })
        setUnsignedMembership(unsignedMemberhips)
        methods.setValue(
          'membership.claim', unsignedMemberhips.credentialSubject as unknown as MembershipSubject
        )
      } catch (error) {
        console.error(error)
        loader?.error(error)
      } finally {
        loader?.finish()
      }
    })().catch(e => { throw e })
  }, [])

  const _props = {
    t, i18n
  }

  return <Fragment>
    <DialogContent>
      <WalletFormProvider {...methods}>
        <PrimaryForm {..._props} title="membership.claim.title">
          {groupSubjet && <MainTextOutput {..._props} field="membership.group.name" showHint />}
          <MainTextInput {..._props} field="membership.claim.groupId" />
          <MainTextInput {..._props} field="membership.claim.role" />
          <MainTextOutput {...props} field="membership.claim.createdAt" showHint formatter={dateFormatter} />
          <FormMainAction {...props} title="membership.claim.create" action={methods.handleSubmit(() => {
            console.log(unsignedMemberhips)
          })} />
        </PrimaryForm>
      </WalletFormProvider>
    </DialogContent>
  </Fragment>
})

export type MembershipClaimParams = EmptyProps & {
  ext: RegovGroupExtension,
  group?: Credential,
  close?: () => void
}

export type MembershipClaimProps = RegovComponetProps<MembershipClaimParams>

export type MembershipClaimFields = {
  membership: {
    group: GroupSubject | undefined
    claim: MembershipSubject
  }
}