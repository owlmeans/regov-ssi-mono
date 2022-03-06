import React from 'react'
import { Button, ListItem, ListItemButton, ListItemText } from '@mui/material'
import { MainMenuItemImplProps } from '../../../../common'


export const MainMenuItemWeb = ({ title, t, ns, action }: MainMenuItemImplProps) => {
  return <ListItem>
    <ListItemButton component={Button} onClick={action}>
      <ListItemText primary={t(title, { ns })} />
    </ListItemButton>
  </ListItem>
}