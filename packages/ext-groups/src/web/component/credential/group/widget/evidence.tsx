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

import React, { FunctionComponent } from 'react'
import { Extension } from '@owlmeans/regov-ssi-core'
import { EmptyProps, PurposeEvidenceWidgetParams, RegovComponentProps, withRegov } from '@owlmeans/regov-lib-react'
import { getCompatibleSubject } from '@owlmeans/regov-ssi-core'
import { dateFormatter } from '@owlmeans/regov-lib-react'
import { GroupSubject } from '../../../../../types'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'


export const EvidenceWidget = (ext: Extension): FunctionComponent<EvidenceWidgetParams> =>
  withRegov<EvidenceWidgetProps>({ namespace: ext.localization?.ns }, (props: EvidenceWidgetProps) => {
    const { wrapper, t } = props
    const subject = getCompatibleSubject<GroupSubject>(wrapper.credential)

    return <Grid container direction="column" justifyContent="space-between" alignItems="space-between">
      <Grid item container px={1} direction="row" justifyContent="space-between" alignItems="flex-start">
        <Grid item container xs={10} pt={1} direction="column" justifyContent="space-between" alignItems="stretch">
          <Grid item>
            <Typography variant='overline'>{`${t('group.widget.evidence.name')}`}: {subject.name}</Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item px={1}>
        <Typography variant='overline'>{`${t('group.widget.evidence.uuid')}`}: {subject.uuid}</Typography>
      </Grid>
      <Grid item px={1}>
        <Typography variant='overline'>{`${t('group.widget.evidence.createdAt')}`}: {dateFormatter(subject.createdAt)}</Typography>
      </Grid>
      {subject.description && subject.description !== '' && <Grid item px={1}>
        <Typography variant='overline'>{subject.description}</Typography>
      </Grid>}
    </Grid>
  })

export type EvidenceWidgetParams = EmptyProps & PurposeEvidenceWidgetParams

export type EvidenceWidgetProps = RegovComponentProps<EvidenceWidgetParams>