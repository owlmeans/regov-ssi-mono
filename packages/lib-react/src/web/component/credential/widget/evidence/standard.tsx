import React, { FunctionComponent } from 'react'
import { PurposeEvidenceWidgetParams } from '../../../../../common'
import { Paper, Grid, Typography } from '@mui/material'
import { normalizeValue } from '@owlmeans/regov-ssi-core'


export const StandardEvidenceWidget: FunctionComponent<PurposeEvidenceWidgetParams> =
  ({ wrapper }: PurposeEvidenceWidgetParams) => {

    console.log(wrapper)

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