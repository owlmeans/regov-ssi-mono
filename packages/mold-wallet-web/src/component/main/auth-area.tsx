import React from 'react'
import { Outlet } from 'react-router-dom'

import { MainAuthArea } from '@owlmeans/regov-lib-react'
import { Grid } from '@mui/material'
import { WalletMainMenu } from './menu'


export const WalletMainAuthArea = () => {
  return <MainAuthArea>
    <Grid container direction="row" justifyContent="center" alignItems="flex-start">
      <Grid item xs={3} lg={2} xl={1}><WalletMainMenu /></Grid>
      <Grid item xs={9} lg={10} xl={11}><Outlet /></Grid>
    </Grid>
  </MainAuthArea>
}