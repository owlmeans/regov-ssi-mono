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

import React, { Fragment, useMemo } from 'react'

import { 
  CredentialWrapper, getCompatibleSubject, REGISTRY_SECTION_OWN, REGISTRY_TYPE_IDENTITIES 
} from '@owlmeans/regov-ssi-core'
import { EmptyImplProps, RegovComponentProps, withRegov } from '@owlmeans/regov-lib-react'
import { Extension } from '@owlmeans/regov-ssi-core'
import { IdentitySubject } from '../../../types'
import { dateFormatter, ItemMenuHandle, MenuIconButton, ItemMenu } from '@owlmeans/regov-lib-react'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'


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
              exportTitle={`${identityWrap.meta.title}.identity`} meta={{
                id: identityWrap.credential.id,
                registry: REGISTRY_TYPE_IDENTITIES,
                section: REGISTRY_SECTION_OWN
              }} />
          </Grid>
        </Grid>
      </Grid>
      <Grid item px={1}>
        <Typography variant='overline'>{`${t('widget.dashboard.issuedAt')}`}: {dateFormatter(subject.createdAt)}</Typography>
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

type DashboardWidgetProps = RegovComponentProps<
  DashboardWidgetParams, EmptyImplProps, DashboardWidgetState
>