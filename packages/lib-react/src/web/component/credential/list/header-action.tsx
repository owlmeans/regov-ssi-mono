import { Switch } from '@mui/material'
import { CredentialListTab, WrappedComponentProps } from '../../../../common'
import { REGISTRY_SECTION_PEER } from '@owlmeans/regov-ssi-core'
import React, { Fragment } from 'react'


export const CredentialListHeaderAction = (props: HeaderActionProps) => {
  const { details, section, action } = props

  if (!details.registry.sections) {
    if (details.registry.allowPeer) {
      return <Switch checked={section === REGISTRY_SECTION_PEER} onChange={action}/>
    }
  }

  return <Fragment />
}


export type HeaderActionProps = WrappedComponentProps<HeaderActionParams>

export type HeaderActionParams = {
  section: string
  details: CredentialListTab
  action: () => void
}