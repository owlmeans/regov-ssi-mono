import React from 'react'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import { useTranslation } from 'react-i18next'
import { CredentialListItemInputRenderer } from '../types'


export const CredentialListItemInputSimpleRenderer: CredentialListItemInputRenderer = props => {
  const prefix = `input.${props.config.prefix ? `${props.config.prefix}.` : ''}`
  const { t } = useTranslation(props.ns)

  return <ListItem>
    <ListItemButton onClick={() => props.control.openDetails(props.config, props.ns)}>
      {t(`${prefix}${props.config.field}`)}
    </ListItemButton>
  </ListItem>
}
