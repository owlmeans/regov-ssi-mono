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

import React, { Fragment } from 'react'
import { MainFooterImplProps, useRegov } from '../../../common'
import AppBar from '@mui/material/AppBar'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import Toolbar from '@mui/material/Toolbar'


export const MainFooterWeb = ({ t }: MainFooterImplProps) => {
  const { config } = useRegov()

  return config.urls ? <AppBar position="fixed" color="default" sx={{ top: 'auto', bottom: 0 }}>
    <Toolbar>
      <Grid container direction="row" justifyContent="center" alignItems="center">
        {
          config.urls?.privacyPolicy
          && <Link sx={{ p: 2 }} href={config.urls?.privacyPolicy} target="_blank" color="primary.light">
            {`${t('footer.link.policy')}`}
          </Link>
        }
        {
          config.urls?.terms
          && <Link sx={{ p: 2 }} href={config.urls?.terms} target="_blank" color="primary.light">
            {`${t('footer.link.terms')}`}
          </Link>
        }
        {
          config.urls?.guides
          && <Link sx={{ p: 2 }} href={config.urls?.guides} target="_blank" color="primary.light">
            {`${t('footer.link.guides')}`}
          </Link>
        }
      </Grid>
    </Toolbar>
  </AppBar> : <Fragment />
}