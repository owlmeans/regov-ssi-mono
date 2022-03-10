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

import React, { FunctionComponent } from 'react'
import { PurposeEvidenceWidgetParams } from '../../../../../common'
import { Paper, Grid, Typography } from '@mui/material'
import { normalizeValue } from '@owlmeans/regov-ssi-core'


export const StandardEvidenceWidget: FunctionComponent<PurposeEvidenceWidgetParams> =
  ({ wrapper }: PurposeEvidenceWidgetParams) => {
    return <Grid container direction="column" justifyContent="flex-start" alignItems="stretch">
      <Grid item>
        <Typography variant="h6">{wrapper.meta.title}</Typography>
      </Grid>
      <Grid item>
        <Typography variant="subtitle1">{normalizeValue(wrapper.credential.type).join(', ')}</Typography>
      </Grid>
      <Grid item>
        <Paper variant="outlined" sx={{ padding: 1 }}>
          <Typography variant="overline">
            <pre>{JSON.stringify(wrapper.credential.credentialSubject, undefined, 2)}</pre>
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  }