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

import React from 'react'
import {
  CredentialList, CredentialListTab, useNavigator, CredentialListNavigator, CredentialListNavigatorParams,
  NavigatorContextProvider
} from '../../../common'
import {
  RegistryType, REGISTRY_SECTION_OWN, REGISTRY_SECTION_PEER, REGISTRY_TYPE_CLAIMS,
  REGISTRY_TYPE_CREDENTIALS, REGISTRY_TYPE_IDENTITIES, REGISTRY_TYPE_REQUESTS,
} from '@owlmeans/regov-ssi-core'
import { useNavigate, useParams } from 'react-router-dom'
import { CredentialHeader } from '../../component'


export const WalletCredentialList = () => {
  const navigate = useNavigate()
  const { tab, section, id } = useParams<RegistryType | string>()
  const nav = useNavigator<CredentialListNavigator>({
    menu: async (location: string, params: CredentialListNavigatorParams) => {
      navigate(`/credential/list/${location}/${params.section || ''}`)
    },
    
    create: async (path: string) => {
      navigate(`/credential/create/${path}`)
    },
    
    request: async (path: string) => {
      navigate(`/credential/request/${path}`)
    }
  })

  return <NavigatorContextProvider navigator={nav}>
    <CredentialHeader />
    <CredentialList tab={tab} section={section} id={id} tabs={walletCredentialListTabs} />
  </NavigatorContextProvider>
}


export const walletCredentialListTabs: CredentialListTab[] = [
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
    name: REGISTRY_TYPE_REQUESTS,
    registry: {
      type: REGISTRY_TYPE_REQUESTS,
      defaultSection: REGISTRY_SECTION_OWN,
      allowPeer: false,
    }
  },
  // {
  //   name: REGISTRY_TYPE_UNSIGNEDS,
  //   registry: {
  //     type: REGISTRY_TYPE_UNSIGNEDS,
  //     defaultSection: REGISTRY_SECTION_OWN,
  //     allowPeer: false,
  //   }
  // },
]