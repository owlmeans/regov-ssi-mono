import React from 'react'

import {
  CredentialList,
  CredentialListTab,
  useNavigator,
  CredentialListNavigator,
  CredentialListNavigatorParams,
  NavigatorContextProvider
} from '@owlmeans/regov-lib-react'
import {
  RegistryType,
  REGISTRY_SECTION_OWN,
  REGISTRY_SECTION_PEER,
  REGISTRY_TYPE_CLAIMS,
  REGISTRY_TYPE_CREDENTIALS,
  REGISTRY_TYPE_IDENTITIES,
  REGISTRY_TYPE_UNSIGNEDS
} from '@owlmeans/regov-ssi-core'
import { useNavigate, useParams } from 'react-router-dom'
import { CredentialHeader } from '../../component'


export const WalletCredentialList = () => {
  const navigate = useNavigate()
  const { tab, section } = useParams<{ tab: RegistryType, section: string }>()
  const nav = useNavigator<CredentialListNavigator>({
    menu: async (location: string, params: CredentialListNavigatorParams) => {
      navigate(`/credential/list/${location}/${params.section || ''}`)
    },
    create: async (path: string) => {
      navigate(`/credential/create/${path}`)
    }
  })

  return <NavigatorContextProvider navigator={nav}>
    <CredentialHeader />
    <CredentialList tab={tab} section={section} tabs={walletCredentialListTabs} />
  </NavigatorContextProvider>
}


const walletCredentialListTabs: CredentialListTab[] = [
  {
    name: REGISTRY_TYPE_CREDENTIALS,
    registry: {
      type: REGISTRY_TYPE_CREDENTIALS,
      defaultSection: REGISTRY_SECTION_OWN,
      allowPeer: true,
    }
  },
  {
    name: REGISTRY_TYPE_IDENTITIES,
    registry: {
      type: REGISTRY_TYPE_IDENTITIES,
      defaultSection: REGISTRY_SECTION_PEER,
      allowPeer: true,
    }
  },
  {
    name: REGISTRY_TYPE_CLAIMS,
    registry: {
      type: REGISTRY_TYPE_CLAIMS,
      defaultSection: REGISTRY_SECTION_OWN,
      allowPeer: true,
    }
  },
  {
    name: REGISTRY_TYPE_UNSIGNEDS,
    registry: {
      type: REGISTRY_TYPE_UNSIGNEDS,
      defaultSection: REGISTRY_SECTION_OWN,
      allowPeer: false,
    }
  },
]