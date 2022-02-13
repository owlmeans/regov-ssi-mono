import React, { Fragment, useMemo } from 'react'

import {
  CredentialWrapper,
  getCompatibleSubject
} from '@owlmeans/regov-ssi-core'
import {
  EmptyImplProps,
  RegovComponetProps,
  withRegov
} from '@owlmeans/regov-lib-react'
import {
  Extension
} from '@owlmeans/regov-ssi-extension'
import {
  Grid,
  Typography
} from '@mui/material'
import { IdentitySubject } from '@owlmeans/regov-ext-identity'
import {
  dateFormatter,
  ItemMenuHandle,
  MenuIconButton,
  ItemMenu
} from '@owlmeans/regov-mold-wallet-web'


export const DashboardWidget = (ext: Extension) =>
  withRegov<DashboardWidgetProps>({
    namespace: ext.localization?.ns,
    transformer: (wallet) => {
      return { identityWrap: wallet?.getIdentity() }
    }
  }, (props: DashboardWidgetProps) => {
    const { t, i18n, identityWrap } = props
    if (!identityWrap) {
      return <Fragment />
    }
    const subject = getCompatibleSubject<IdentitySubject>(identityWrap.credential)

    const handle: ItemMenuHandle = useMemo(() => ({ handler: undefined }), [identityWrap.credential.id])

    return <Grid container direction="column" justifyContent="space-between" alignItems="space-between">
      <Grid item container px={1} direction="row" justifyContent="space-between" alignItems="flex-start">
        <Grid item container xs={10} pt={1} direction="column" justifyContent="space-between" alignItems="stretch">
          <Grid item>
            <Typography variant='caption'>{identityWrap.meta.title}</Typography>
          </Grid>
          <Grid item>
            <Typography variant='overline'>ID: {subject.identifier}</Typography>
          </Grid>
        </Grid>
        <Grid item container xs={2} pr={1} direction="row" justifyContent="flex-end" alignItems="flex-end">
          <Grid item>
            <MenuIconButton handle={handle} />
            <ItemMenu handle={handle} content={identityWrap.credential} i18n={i18n} prettyOutput
              exportTitle={`${identityWrap.meta.title}.identity`} />
          </Grid>
        </Grid>
      </Grid>
      <Grid item px={1}>
        <Typography variant='overline'>{t('widget.dashboard.issuedAt')}: {dateFormatter(subject.createdAt)}</Typography>
      </Grid>
      <Grid item container px={1} mt={2} direction="row" justifyContent="space-between" alignItems="flex-end">
        <Grid item xs={7}>
          <Typography variant='caption' fontSize={8} noWrap>{subject.uuid}</Typography>
        </Grid>
        <Grid item container xs={5} direction="row" justifyContent="flex-end" alignItems="flex-end">
          <Grid item>
            <Typography variant='caption' fontSize={8}>{subject.sourceApp}</Typography>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  })

type DashboardWidgetParams = {
}

type DashboardWidgetState = {
  identityWrap: CredentialWrapper
}

type DashboardWidgetProps = RegovComponetProps<
  DashboardWidgetParams, EmptyImplProps, DashboardWidgetState
>