import React from 'react'

import {
  Box,
  Divider,
  Tab,
  Tabs,
} from '@mui/material'
import {
  CredentialListImplProps
} from '@owlmeans/regov-lib-react'
import {
  SimpleList,
  SimpleListItem
} from '../common'
import { CredentialListHeaderAction } from './list/header-action'
import { REGISTRY_SECTION_OWN } from '@owlmeans/regov-ssi-core'


export const CredentialListWeb = (props: CredentialListImplProps) => {
  const { credentials, tabs, t, tab, section } = props
  const currentTab = tabs.find(_tab => _tab.name === tab) || tabs[0]

  return <Box>
    <Box>
      <Tabs value={tab} variant="scrollable" scrollButtons="auto"
        onChange={(_, tab) => props.switchTab(tab)}>
        {tabs.map(
          tab => <Tab key={tab.name} value={tab.registry.type} label={t(`list.tab.${tab.name}.label`)} />
        )}
      </Tabs>
      <Divider />
    </Box>
    <SimpleList {...props} title={`list.header.${currentTab.name}.${section}.title`} headerAction={
      <CredentialListHeaderAction {...props} details={currentTab}
        section={section || REGISTRY_SECTION_OWN}
        action={props.binarySectionSwitch} />
    }>
      {
        credentials.map(
          wrapper => {
            const credHint = wrapper.credential.type.join(', ')
            const signStatus = `list.item.${wrapper.credential.proof ? 'signed' : 'unsigned'}`

            return <SimpleListItem key={wrapper.credential.id} {...props} noTranslation
              label={wrapper.meta.title || t('list.item.unknown')}
              hint={`${credHint} - ${t(signStatus)}`} />
          }
        )
      }
    </SimpleList>
  </Box>
}