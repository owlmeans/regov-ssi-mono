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
  CredentialWrapper, RegistryType, REGISTRY_SECTION_OWN, REGISTRY_SECTION_PEER, REGISTRY_TYPE_CREDENTIALS
} from '@owlmeans/regov-ssi-core'
import React, { FunctionComponent } from 'react'
import {
  BasicNavigator, EmptyProps, RegovComponentProps, WalletNavigatorMenuMethod, withRegov,
  WrappedComponentProps
} from '../../common/'


export const CredentialList: FunctionComponent<CredentialListParams> = withRegov<
  CredentialListProps, CredentialListNavigator
>('CredentialList',
  ({ t, i18n, credentials, tab, section, id, tabs, navigator, renderer: Renderer, ns }) => {
    const currentTab = tab || tabs[0].registry.type || REGISTRY_TYPE_CREDENTIALS
    const currentSection = section || REGISTRY_SECTION_OWN

    const _props: CredentialListImplProps = {
      t, i18n, tabs, id, ns,
      tab: currentTab,
      section: currentSection,
      credentials: credentials,
      binarySectionSwitch: () => {
        navigator?.menu && navigator.menu(currentTab, {
          section: currentSection === REGISTRY_SECTION_PEER ? REGISTRY_SECTION_OWN : REGISTRY_SECTION_PEER
        })
      },
      switchTab: (tab: string) => {
        const selectedTab = tabs.find(_tab => _tab.registry.type === tab) as CredentialListTab
        if (!selectedTab) {
          return
        }
        const { registry: details } = selectedTab
        const defaultSection = details.defaultSection || (details.sections
          ? details.defaultSection || details.sections[0]
          : REGISTRY_SECTION_OWN
        )

        navigator?.menu && navigator.menu(tab, { section: defaultSection })
      }
    }

    return <Renderer {..._props}  />
  },
  {
    namespace: 'regov-wallet-credential', transformer: (wallet, { tab, section }: CredentialListProps) => {
      return {
        credentials: wallet?.getRegistry(tab || REGISTRY_TYPE_CREDENTIALS)
          .registry.credentials[section || REGISTRY_SECTION_OWN] || []
      }
    }
  }
)


export type CredentialListParams = {
  tabs: CredentialListTab[]
  tab?: RegistryType
  section?: string
  id?: string
} & EmptyProps

export type CredentialListTab = {
  name: string
  registry: {
    type: RegistryType
    defaultSection?: string
    allowPeer?: boolean
    sections?: string[]
  }
}


export type CredentialListState = {
  credentials: CredentialWrapper[]
}

export type CredentialListProps = RegovComponentProps<
  CredentialListParams, CredentialListImplProps, CredentialListState, CredentialListNavigator
>

export type CredentialListImplProps = WrappedComponentProps<
  CredentialListImplParams, CredentialListState
>

export type CredentialListImplParams = EmptyProps & {
  tabs: CredentialListTab[]
  tab?: RegistryType
  section?: string
  id?: string
  binarySectionSwitch: () => void
  switchTab: (tab: string) => void
}

export type CredentialListNavigator = BasicNavigator & {
  menu?: WalletNavigatorMenuMethod<CredentialListNavigatorItem, CredentialListNavigatorParams>
  create?: WalletNavigatorMenuMethod<string>
  request?: WalletNavigatorMenuMethod<string>
}

export type CredentialListNavigatorItem = RegistryType
export type CredentialListNavigatorParams = {
  section: string
}