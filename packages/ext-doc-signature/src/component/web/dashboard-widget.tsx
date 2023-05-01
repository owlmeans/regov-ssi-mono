/**
 *  Copyright 2023 OwlMeans
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

import { RegovComponentProps, withRegov } from '@owlmeans/regov-lib-react'
import { Extension } from '@owlmeans/regov-ssi-core'
import React, { Fragment, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { REGOV_CREDENTIAL_TYPE_SIGNATURE } from '../../types'
import Add from '@mui/icons-material/Add'
import AddCircleOutline from '@mui/icons-material/AddCircleOutline'
import Drafts from '@mui/icons-material/Drafts'

import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import MenuList from '@mui/material/MenuList'
import Typography from '@mui/material/Typography'


export const DashboardWidgetWeb = (ext: Extension) => withRegov<DashboardWidgetProps>(
  { namespace: ext.localization?.ns }, (props) => {
    const { t } = props
    const navigate = useNavigate()
    const [openMenu, setOpenMenu] = useState<boolean>(false)
    const pathCreate = `/credential/create/${ext.schema.details.code}/${REGOV_CREDENTIAL_TYPE_SIGNATURE}`
    const pathRequest = `/credential/request/${ext.schema.details.code}/${REGOV_CREDENTIAL_TYPE_SIGNATURE}`

    return <Fragment>
      <Grid container height="100%" direction="row" justifyContent="center" alignItems="sretch"
        onClick={() => setOpenMenu(true)} style={{ cursor: "pointer" }}>
        <Grid item xs={3}>&nbsp;</Grid>
        <Grid item container xs={6} direction="column" justifyContent="space-between" alignItems="center">
          <Grid item>&nbsp;</Grid>
          <Grid item container direction="row" justifyContent="space-between" alignItems="center">
            <Grid item>
              <Typography variant="h6">{`${t('dashboard.widget.signature.add')}`} </Typography>
            </Grid>
            <Grid item><Add /></Grid>
          </Grid>
          <Grid item>&nbsp;</Grid>
        </Grid>
        <Grid item xs={3}>&nbsp;</Grid>
      </Grid>
      <Dialog open={openMenu} scroll="paper" onClose={() => setOpenMenu(false)}>
        <DialogTitle>{`${t('dashboard.widget.menu.title')}`}</DialogTitle>
        <DialogContent>
          <MenuList>
            <MenuItem onClick={() => navigate(pathRequest)}>
              <ListItemIcon><Drafts fontSize="small" /></ListItemIcon>
              <ListItemText>{`${t('dashboard.widget.menu.request')}`}</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => navigate(pathCreate)}>
              <ListItemIcon><AddCircleOutline fontSize="small" /></ListItemIcon>
              <ListItemText>{`${t('dashboard.widget.menu.create')}`}</ListItemText>
            </MenuItem>
          </MenuList>
        </DialogContent>
      </Dialog>
    </Fragment>
  })


type DashboardWidgetParams = {
}

type DashboardWidgetProps = RegovComponentProps<DashboardWidgetParams>