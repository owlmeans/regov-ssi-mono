import React, {
  Fragment,
  FunctionComponent
} from 'react'
import {
  CredentialEvidenceWidget,
  EmptyProps,
  RegovCompoentProps,
  withRegov
} from '@owlmeans/regov-lib-react'
import {
  REGOV_EXT_GROUP_NAMESPACE,
  RegovGroupExtension,
  GroupSubject
} from '@owlmeans/regov-ext-groups'
import {
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
} from '@mui/material'
import {
  Credential,
  geCompatibletSubject
} from '@owlmeans/regov-ssi-core'
import {
  EntityRenderer,
  EntityTextRenderer
} from '@owlmeans/regov-mold-wallet-web'
import { People } from '@mui/icons-material'


export const GroupView: FunctionComponent<GroupViewParams> = withRegov<GroupViewProps>({
  namespace: REGOV_EXT_GROUP_NAMESPACE
}, ({ t, credential }) => {
  const subject = geCompatibletSubject<GroupSubject>(credential)

  return <Fragment>
    <DialogTitle>{t('group.view.title', { name: subject.name })}</DialogTitle>
    <DialogContent>
      <Grid container direction="column" justifyContent="flex-start" alignItems="stretch">
        <Grid item container direction="row" justifyContent="space-between" alignItems="flex-start">
          <Grid item xs={12} sm={6} md={7} px={1}>
            <Paper elevation={3}>
              <EntityRenderer t={t} entity="group" title={
                <Fragment>
                  <Grid container direction="row" spacing={1} justifyContent="flex-start" alignItems="flex-start">
                    <Grid item>
                      <People fontSize="large" />
                    </Grid>
                    <Grid item>
                      {subject.name}
                    </Grid>
                  </Grid>
                </Fragment>
              } subject={subject}>
                {subject.description.trim() !== "" && <EntityTextRenderer field="description" showLabel />}
                <Grid item container direction="row" justifyContent="space-between" alignItems="flex-start">
                  <EntityTextRenderer field="createdAt" showHint small netSize={6} />
                  <EntityTextRenderer field="uuid" showHint small netSize={6} />
                </Grid>
              </EntityRenderer>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={5} px={1}>
            <Paper elevation={3}>
              Trust summary
            </Paper>
          </Grid>
        </Grid>
        <Grid item>
          <CredentialEvidenceWidget />
        </Grid>
      </Grid>
    </DialogContent>
  </Fragment>
})

export type GroupViewParams = EmptyProps & {
  ext: RegovGroupExtension,
  credential: Credential
}

export type GroupViewProps = RegovCompoentProps<GroupViewParams>

