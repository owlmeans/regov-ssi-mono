import React, { Fragment } from 'react'
import { Outlet } from 'react-router-dom'

import {
  MainAuthAreaImplProps
} from '@owlmeans/regov-lib-react'
import {
  AppBar,
  Grid,
  Toolbar,
  Typography
} from '@mui/material'


export const MainAuthAreaWeb = ({ name, menu }: MainAuthAreaImplProps) => {
  return <Fragment>
    <AppBar position="fixed" style={{ height: 75, maxHeight: 75 }}>
      <Toolbar>
        <Grid container item direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">{name}</Typography>
        </Grid>
      </Toolbar>
    </AppBar>
    <Grid container direction="row" justifyContent="center" alignItems="flex-start"
      style={{ marginTop: 80 }}>
      <Grid item xs={4} sm={3} lg={2} xl={1}>
        {menu}
      </Grid>
      <Grid item xs={8} sm={9} lg={10} xl={11}>
        <Outlet />
      </Grid>
    </Grid>
  </Fragment>
}