import React from 'react'

import {
  MainDashboardImplProps,
  NavigatorContextProvider,
  useNavigator,
  useRegov
} from '@owlmeans/regov-lib-react'
import {
  Grid,
  Paper
} from '@mui/material'
import {
  CredentialProcessor,
  EXTENSION_ITEM_PURPOSE_DASHBOARD_WIDGET
} from '@owlmeans/regov-lib-react'
import { ListNavigator, partialListNavigator } from './navigator'
import { useNavigate } from 'react-router-dom'


export const MainDashboardWeb = ({ }: MainDashboardImplProps) => {
  const { extensions } = useRegov()

  const navigate = useNavigate()
  const nav = useNavigator<ListNavigator>(partialListNavigator(navigate))

  return <NavigatorContextProvider navigator={nav}>
    <Grid container direction="column" justifyContent="flex-start" alignItems="stretch">
      <Grid item container direction="row" justifyContent="flex-start" alignItems="stretch">
        {extensions?.produceComponent(EXTENSION_ITEM_PURPOSE_DASHBOARD_WIDGET).map(
          (ext, idx) => <Grid key={`${ext.extensionCode}-${idx}`} item p={1} xs={12} sm={6} md={4}>
            <Paper style={{ height: 125, maxHeight: 125, minWidth: 325, overflowY: 'hidden' }}>{<ext.com />}</Paper>
          </Grid>
        )}
      </Grid>
      <Grid item container direction="column" justifyContent="flex-start" alignItems="stretch">
        <CredentialProcessor />
      </Grid>
    </Grid>
  </NavigatorContextProvider>
}