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

import React, { Fragment, FunctionComponent, useEffect, useState } from 'react'

import {
  Credential, getCompatibleSubject, REGISTRY_SECTION_OWN, REGISTRY_TYPE_CLAIMS, UnsignedCredential
} from '@owlmeans/regov-ssi-core'
import { 
  EmptyProps, generalNameVlidation, RegovComponentProps, useNavigator, useRegov, withRegov 
} from '@owlmeans/regov-lib-react'
import {
  RegovGroupExtension, REGOV_EXT_GROUP_NAMESPACE, MembershipSubject, GroupSubject, 
  REGOV_CREDENTIAL_TYPE_MEMBERSHIP
} from '../../../../types'
import {
  AlertOutput, dateFormatter, FormMainAction, MainTextInput, MainTextOutput, PrimaryForm, WalletFormProvider, 
  ListNavigator, partialListNavigator
} from '@owlmeans/regov-lib-react'
import { useForm } from 'react-hook-form'
import { ERROR_MEMBERSHIP_READYTO_CLAIM, ERROR_WIDGET_AUTHENTICATION, ERROR_WIDGET_EXTENSION } from '../../types'
import { useNavigate } from 'react-router-dom'
import { addToValue } from '@owlmeans/regov-ssi-core'
import DialogContent from '@mui/material/DialogContent'


export const MembershipClaim: FunctionComponent<MembershipClaimParams> = withRegov<
  MembershipClaimProps, ListNavigator
>({ namespace: REGOV_EXT_GROUP_NAMESPACE }, (props) => {
  const { group, t, i18n, ext } = props
  const { handler, extensions } = useRegov()
  const navigate = useNavigate()
  const navigator = useNavigator<ListNavigator>(partialListNavigator(navigate))
  const groupSubjet = group ? getCompatibleSubject<GroupSubject>(group) : undefined
  const [unsignedMemberhip, setUnsignedMembership] = useState<UnsignedCredential | undefined>(undefined)

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
        const unsignedMemberhips = await factory.build(handler.wallet, {
          extensions: extensions?.registry,
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
    t, i18n, rules: {
      'membership.claim.role': generalNameVlidation()
    }
  }

  const claim = async (data: MembershipClaimFields) => {
    const loader = await navigator?.invokeLoading()
    try {
      if (!handler.wallet) {
        throw ERROR_WIDGET_AUTHENTICATION
      }
      if (!unsignedMemberhip || !ext) {
        throw ERROR_MEMBERSHIP_READYTO_CLAIM
      }
      /**
       * @TODO Move all this stuff to some credential specific method
       */
      const extendSubject = {
        role: data.membership.claim.role,
        description: data.membership.claim.description
      }
      unsignedMemberhip.credentialSubject = {
        ...unsignedMemberhip.credentialSubject,
        ...extendSubject
      }

      if (group) {
        unsignedMemberhip.evidence = addToValue(unsignedMemberhip.evidence ,group)
      }
      const factory = ext.getFactory(unsignedMemberhip.type)
      const claim = await factory.claim(handler.wallet, { unsignedClaim: unsignedMemberhip })

      const registry = handler.wallet.getRegistry(REGISTRY_TYPE_CLAIMS)
      const item = await registry.addCredential(claim)

      item.meta.title = t('membership.claim.meta.title', {
        group: groupSubjet?.name,
        role: data.membership.claim.role
      })

      loader?.success(t('membership.claim.success'))

      handler.notify()

      if (props.finish && item.credential.id) {
        props.finish()

        await (navigator as ListNavigator).item(REGISTRY_TYPE_CLAIMS, {
          section: REGISTRY_SECTION_OWN,
          id: item.credential.id
        })
      }
    } catch (error) {
      console.error(error)
      loader?.error(error)
      if (error.message) {
        methods.setError('membership.claim.alert', { type: error.message })
        return
      }
    } finally {
      loader?.finish()
    }
  }

  return <Fragment>
    <DialogContent>
      <WalletFormProvider {...methods}>
        <PrimaryForm {..._props} title="membership.claim.title">
          {groupSubjet && <MainTextOutput {..._props} field="membership.group.name" showHint />}
          <MainTextOutput {..._props} field="membership.claim.groupId" showHint />
          <MainTextInput {..._props} field="membership.claim.role" />
          <MainTextInput {..._props} field="membership.claim.description" />
          <MainTextOutput {...props} field="membership.claim.createdAt" showHint formatter={dateFormatter} />
          <AlertOutput {...props} field="membership.claim.alert" />
          <FormMainAction {...props} title="membership.claim.create" action={methods.handleSubmit(claim)} />
        </PrimaryForm>
      </WalletFormProvider>
    </DialogContent>
  </Fragment>
})

export type MembershipClaimParams = EmptyProps & {
  ext: RegovGroupExtension,
  group?: Credential,
  close?: () => void
  finish?: () => void
}

export type MembershipClaimProps = RegovComponentProps<MembershipClaimParams>

export type MembershipClaimFields = {
  membership: {
    group: GroupSubject | undefined
    claim: MembershipSubject & {
      alert?: string
    }
  }
}