import React, { FunctionComponent } from 'react'
import { Extension } from '@owlmeans/regov-ssi-core'
import { 
  EmptyProps, PurposeEvidenceWidgetParams, RegovComponentProps, withRegov 
} from '@owlmeans/regov-lib-react'
import { Grid, Typography } from '@mui/material'
import { getCompatibleSubject } from '@owlmeans/regov-ssi-core'
import { dateFormatter } from '@owlmeans/regov-lib-react'
import { MembershipSubject } from '../../../../../types'


export const MembershipEvidenceWidget = (ext: Extension): FunctionComponent<MembershipEvidenceWidgetParams> =>
  withRegov<MembershipEvidenceWidgetProps>({ namespace: ext.localization?.ns }, (props) => {
    const { wrapper, t } = props

    const subject = getCompatibleSubject<MembershipSubject>(wrapper.credential)

    return <Grid container direction="column" justifyContent="space-between" alignItems="space-between">
      <Grid item container px={1} direction="row" justifyContent="space-between" alignItems="flex-start">
        <Grid item container xs={10} pt={1} direction="column" justifyContent="space-between" alignItems="stretch">
          <Grid item>
            <Typography variant='overline'>Code: {subject.memberCode}</Typography>
          </Grid>
        </Grid>
        {/* <Grid item container xs={2} pr={1} direction="row" justifyContent="flex-end" alignItems="flex-end">
          <Grid item>
            <MenuIconButton handle={handle} />
            <ItemMenu handle={handle} content={identityWrap.credential} i18n={i18n} prettyOutput
              exportTitle={`${identityWrap.meta.title}.identity`} />
          </Grid>
        </Grid> */}
      </Grid>
      <Grid item px={1}>
        <Typography variant='overline'>{t('membership.widget.evidence.groupId')}: {subject.groupId}</Typography>
      </Grid>
      <Grid item px={1}>
        <Typography variant='overline'>{t('membership.widget.evidence.role')}: {subject.role}</Typography>
      </Grid>
      <Grid item px={1}>
        <Typography variant='overline'>{t('membership.widget.evidence.issuedAt')}: {dateFormatter(subject.createdAt)}</Typography>
      </Grid>
    </Grid>
  })

export type MembershipEvidenceWidgetParams = EmptyProps & PurposeEvidenceWidgetParams

export type MembershipEvidenceWidgetProps = RegovComponentProps<MembershipEvidenceWidgetParams>