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

import React from 'react'
import {
  MainDashboardImplProps, NavigatorContextProvider, useNavigator, useRegov,
  CredentialProcessor, EXTENSION_ITEM_PURPOSE_DASHBOARD_WIDGET
} from '../../../common'
import { ListNavigator, partialListNavigator } from './navigator'
import { useNavigate } from 'react-router-dom'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'


export const MainDashboardWeb = ({ }: MainDashboardImplProps) => {
  const { extensions } = useRegov()

  const navigate = useNavigate()
  const nav = useNavigator<ListNavigator>(partialListNavigator(navigate))

  return <NavigatorContextProvider navigator={nav}>
    <Grid container direction="column" justifyContent="flex-start" alignItems="stretch">
      <Grid item container direction="row" justifyContent="flex-start" alignItems="stretch">
        {extensions?.produceComponent(EXTENSION_ITEM_PURPOSE_DASHBOARD_WIDGET).map(
          (ext, idx) => <Grid key={`${ext.extensionCode}-${idx}`} item p={1}>
            <Paper style={{ height: 140, maxHeight: 140, minWidth: 325, maxWidth: 325, overflowY: 'hidden' }}>{<ext.com />}</Paper>
          </Grid>
        )}
      </Grid>
      <Grid item container direction="column" justifyContent="flex-start" alignItems="stretch">
        <CredentialProcessor />
      </Grid>
    </Grid>
  </NavigatorContextProvider>
}