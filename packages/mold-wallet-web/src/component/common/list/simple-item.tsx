
import React from 'react'

import {
  ListItem, ListItemText
} from '@mui/material'

import { WrappedComponentProps } from '@owlmeans/regov-lib-react'


export const SimpleListItem = ({ t, action, noTranslation, label, hint, children }: SimpleListItemProps) => {
  return <ListItem button onClick={action}>
    <ListItemText primary={noTranslation ? label : t(label)}
      secondary={hint ? noTranslation ? hint : t(hint) : undefined} />
    {children}
  </ListItem>
}

export type SimpleListItemProps = WrappedComponentProps<{
  action?: () => void
  label: string
  hint?: string
  noTranslation?: boolean
}>