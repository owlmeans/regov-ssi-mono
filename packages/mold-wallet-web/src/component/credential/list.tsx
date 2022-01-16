import React, { FunctionComponent, useMemo } from 'react'

import {
  Box,
  Divider,
  Tab,
  Tabs,
} from '@mui/material'
import {
  CredentialListImplProps,
  useRegov,
  EXTENSION_ITEM_PURPOSE_ITEM
} from '@owlmeans/regov-lib-react'
import {
  ItemMenu,
  ItemMenuHandle,
  MenuIconButton,
  SimpleList,
  SimpleListItem
} from '../common'
import { CredentialListHeaderAction } from './list/header-action'
import { Credential, CredentialSubject, CredentialWrapper, REGISTRY_SECTION_OWN } from '@owlmeans/regov-ssi-core'


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
      {credentials.map(
        wrapper => <CredentialListItem key={wrapper.credential.id} wrapper={wrapper} props={props} />
      )}
    </SimpleList>
  </Box>
}

const CredentialListItem = ({ wrapper, props }: CredentialListItemProps) => {
  const { t, i18n } = props
  const { extensions } = useRegov()

  const credHint = wrapper.credential.type.join(', ')
  const signStatus = `list.item.${wrapper.credential.proof ? 'signed' : 'unsigned'}`
  const handle: ItemMenuHandle = useMemo(() => ({ handler: undefined }), [wrapper.credential.id])

  const renderers = extensions?.produceComponent(EXTENSION_ITEM_PURPOSE_ITEM, wrapper.credential.type)
  if (renderers && renderers.length > 0) {
    const renderer = renderers[0]
    const Renderer = renderer.com as FunctionComponent<{ wrapper: typeof wrapper }>
    
    return <Renderer wrapper={wrapper} />
  }

  return <SimpleListItem {...props} noTranslation label={wrapper.meta.title || t('list.item.unknown')}
    hint={`${credHint} - ${t(signStatus)}`}>
    <MenuIconButton handle={handle} />
    <ItemMenu handle={handle} content={wrapper.credential} i18n={i18n} prettyOutput
      exportTitle={`${wrapper.meta.title}.group`} />
  </SimpleListItem>
}

type CredentialListItemProps = {
  wrapper: CredentialWrapper<CredentialSubject, Credential<CredentialSubject>>
  props: CredentialListImplProps
}