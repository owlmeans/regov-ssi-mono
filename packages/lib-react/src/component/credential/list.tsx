import {
  CredentialWrapper,
  RegistryType,
  REGISTRY_SECTION_OWN,
  REGISTRY_SECTION_PEER,
  REGISTRY_TYPE_CREDENTIALS
} from '@owlmeans/regov-ssi-core'
import React, {
  FunctionComponent
} from 'react'
import {
  BasicNavigator,
  EmptyProps,
  RegovComponetProps,
  WalletNavigatorMenuMethod,
  withRegov,
  WrappedComponentProps
} from '../../common'


export const CredentialList: FunctionComponent<CredentialListParams> = withRegov<
  CredentialListProps, CredentialListNavigator
>('CredentialList',
  ({ t, i18n, credentials, tab, section, tabs, navigator, renderer: Renderer }) => {
    const currentTab = tab || tabs[0].registry.type || REGISTRY_TYPE_CREDENTIALS
    const currentSection = section || REGISTRY_SECTION_OWN

    const _props: CredentialListImplProps = {
      t, i18n, tabs,
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

    return <Renderer {..._props} />
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

export type CredentialListProps = RegovComponetProps<
  CredentialListParams, CredentialListImplProps, CredentialListState, CredentialListNavigator
>

export type CredentialListImplProps = WrappedComponentProps<
  CredentialListImplParams, CredentialListState
>

export type CredentialListImplParams = {
  tabs: CredentialListTab[]
  tab?: RegistryType
  section?: string
  binarySectionSwitch: () => void
  switchTab: (tab: string) => void
}

export type CredentialListNavigator = BasicNavigator & {
  menu?: WalletNavigatorMenuMethod<CredentialListNavigatorItem, CredentialListNavigatorParams>
  create?: WalletNavigatorMenuMethod<string>
}

export type CredentialListNavigatorItem = RegistryType
export type CredentialListNavigatorParams = {
  section: string
}