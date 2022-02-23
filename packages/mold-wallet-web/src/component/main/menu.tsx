import React from 'react'
import { MainMenuImplProps } from '@owlmeans/regov-lib-react'
import { List } from '@mui/material'
import { MainMenuItemWeb } from './menu/item'


export const MainMenuWeb = ({ items, t, i18n }: MainMenuImplProps) => {
  return <List>
    {items.map(item => <MainMenuItemWeb key={item.title} {...item} t={t} i18n={i18n} />)}
  </List>
}