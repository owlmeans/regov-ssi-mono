/**
 *  Copyright 2022 OwlMeans
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import React, { Fragment } from 'react'
import { Outlet } from 'react-router-dom'
import { EXTENSION_ITEM_PURPOSE_TOP_ACTION, MainAuthAreaImplProps, MainFooter } from '../../../common'
import { useRegov } from '../../../common/context'
import MenuIcon from '@mui/icons-material/Menu'
import AppBar from '@mui/material/AppBar'
import Grid from '@mui/material/Grid'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'


const drawerWidth = 240;

export const MainAuthAreaWeb = ({ name, menu }: MainAuthAreaImplProps) => {
  const { extensions } = useRegov()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const { config } = useRegov()

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const TopButtons = () =>
    <Fragment>
      {extensions?.produceComponent(EXTENSION_ITEM_PURPOSE_TOP_ACTION).map(
        ext => <ext.com key={ext.extensionCode}/>
      )}
    </Fragment>

  const drawer = (
    <Fragment>
      <Toolbar>
        <div style={{ flexGrow: 1 }}>
          {config.logo}
        </div>
        <TopButtons />
      </Toolbar>
      {menu}
    </Fragment>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          {config.logo}
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>{name}</Typography>
          <TopButtons />
        </Toolbar>
      </AppBar>
      <Box
        component="main"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          <Fragment>
            <Toolbar>
              {config.logo}
            </Toolbar>
            {menu}
          </Fragment>
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, zIndex: "auto" },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        <Grid item><Outlet /></Grid>
      </Box>
      <MainFooter />
    </Box>
  )
}