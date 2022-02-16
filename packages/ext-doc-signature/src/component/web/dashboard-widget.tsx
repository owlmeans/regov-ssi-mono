import { RegovComponetProps, withRegov } from '@owlmeans/regov-lib-react'
import { Extension } from '@owlmeans/regov-ssi-extension'
import React from 'react'
import { Grid, Typography } from '@mui/material'
import { Add } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { REGOV_CREDENTIAL_TYPE_SIGNATURE } from '../../types'


export const DashboardWidgetWeb = (ext: Extension) => withRegov<DashboardWidgetProps>(
  { namespace: ext.localization?.ns }, (props) => {
    const { t } = props
    const navigate = useNavigate()
    const path = `/credential/create/${ext.schema.details.code}/${REGOV_CREDENTIAL_TYPE_SIGNATURE}`

    return <Grid container height="100%" direction="row" justifyContent="center" alignItems="sretch"
      onClick={() => navigate(path)} style={{ cursor: "pointer" }}>
      <Grid item xs={3}>&nbsp;</Grid>
      <Grid item container xs={6} direction="column" justifyContent="space-between" alignItems="center">
        <Grid item>&nbsp;</Grid>
        <Grid item container direction="row" justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h6">{t('dashboard.widget.signature.add')} </Typography>
          </Grid>
          <Grid item><Add /></Grid>
        </Grid>
        <Grid item>&nbsp;</Grid>
      </Grid>
      <Grid item xs={3}>&nbsp;</Grid>
    </Grid>
  })


type DashboardWidgetParams = {
}

type DashboardWidgetProps = RegovComponetProps<DashboardWidgetParams>