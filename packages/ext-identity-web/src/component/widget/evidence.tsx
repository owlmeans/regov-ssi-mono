import React, { FunctionComponent } from 'react'
import { Extension } from '@owlmeans/regov-ssi-extension'
import { EmptyProps, PurposeEvidenceWidgetParams, RegovComponentProps, withRegov } from '@owlmeans/regov-lib-react'
import { Grid, Typography } from '@mui/material'
import { getCompatibleSubject } from '@owlmeans/regov-ssi-core'
import { IdentitySubject } from '@owlmeans/regov-ext-identity'
import { dateFormatter } from '@owlmeans/regov-mold-wallet-web'


export const EvidenceWidget = (ext: Extension): FunctionComponent<EvidenceWidgetParams> =>
  withRegov<EvidenceWidgetProps>({ namespace: ext.localization?.ns }, (props: EvidenceWidgetProps) => {
    const { wrapper, t } = props

    const subject = getCompatibleSubject<IdentitySubject>(wrapper.credential)

    return <Grid container direction="column" justifyContent="space-between" alignItems="space-between">
      <Grid item container px={1} direction="row" justifyContent="space-between" alignItems="flex-start">
        <Grid item container xs={10} pt={1} direction="column" justifyContent="space-between" alignItems="stretch">
          <Grid item>
            <Typography variant='overline'>ID: {subject.identifier}</Typography>
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
        <Typography variant='overline'>{t('widget.evidence.uuid')}: {subject.uuid}</Typography>
      </Grid>
      <Grid item px={1}>
        <Typography variant='overline'>{t('widget.evidence.issuedAt')}: {dateFormatter(subject.createdAt)}</Typography>
      </Grid>
      <Grid item px={1}>
        <Typography variant='overline'>{t('widget.evidence.sourceApp')}: {subject.sourceApp}</Typography>
      </Grid>
    </Grid>
  })

export type EvidenceWidgetParams = EmptyProps & PurposeEvidenceWidgetParams

export type EvidenceWidgetProps = RegovComponentProps<EvidenceWidgetParams>