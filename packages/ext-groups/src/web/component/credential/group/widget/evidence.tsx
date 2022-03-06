import React, { FunctionComponent } from 'react'
import { Extension } from '@owlmeans/regov-ssi-core'
import { EmptyProps, PurposeEvidenceWidgetParams, RegovComponentProps, withRegov } from '@owlmeans/regov-lib-react'
import { Grid, Typography } from '@mui/material'
import { getCompatibleSubject } from '@owlmeans/regov-ssi-core'
import { dateFormatter } from '@owlmeans/regov-lib-react'
import { GroupSubject } from '../../../../../types'


export const EvidenceWidget = (ext: Extension): FunctionComponent<EvidenceWidgetParams> =>
  withRegov<EvidenceWidgetProps>({ namespace: ext.localization?.ns }, (props: EvidenceWidgetProps) => {
    const { wrapper, t } = props
    const subject = getCompatibleSubject<GroupSubject>(wrapper.credential)

    return <Grid container direction="column" justifyContent="space-between" alignItems="space-between">
      <Grid item container px={1} direction="row" justifyContent="space-between" alignItems="flex-start">
        <Grid item container xs={10} pt={1} direction="column" justifyContent="space-between" alignItems="stretch">
          <Grid item>
            <Typography variant='overline'>{t('group.widget.evidence.name')}: {subject.name}</Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item px={1}>
        <Typography variant='overline'>{t('group.widget.evidence.uuid')}: {subject.uuid}</Typography>
      </Grid>
      <Grid item px={1}>
        <Typography variant='overline'>{t('group.widget.evidence.createdAt')}: {dateFormatter(subject.createdAt)}</Typography>
      </Grid>
      {subject.description && subject.description !== '' && <Grid item px={1}>
        <Typography variant='overline'>{subject.description}</Typography>
      </Grid>}
    </Grid>
  })

export type EvidenceWidgetParams = EmptyProps & PurposeEvidenceWidgetParams

export type EvidenceWidgetProps = RegovComponentProps<EvidenceWidgetParams>