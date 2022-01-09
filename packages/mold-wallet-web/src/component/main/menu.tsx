import React from 'react'

import { MainMenuImplProps } from '@owlmeans/regov-lib-react'
import {
  // Drawer,
  List
} from '@mui/material'
import { MainMenuItemWeb } from './menu/item'


export const MainMenuWeb = ({ items, t, i18n }: MainMenuImplProps) => {
  // {/*<Drawer variant="permanent" open={true}>*/}
  return <List>
    {items.map(item => <MainMenuItemWeb key={item.title} {...item} t={t} i18n={i18n} />)}
  </List>

  //{/*</Drawer>*/}
}