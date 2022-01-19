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
  IconButton,
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
import {
  Close,
  People
} from '@mui/icons-material'


export const GroupView: FunctionComponent<GroupViewParams> = withRegov<GroupViewProps>({
  namespace: REGOV_EXT_GROUP_NAMESPACE
}, ({ t, credential, close }) => {
  const subject = geCompatibletSubject<GroupSubject>(credential)

  return <Fragment>
    <DialogTitle>
      <Grid container direction="row" justifyContent="space-between" alignItems="flex-start">
        <Grid item xs={8}>
          {t('group.view.title', { name: subject.name })}
        </Grid>
        <Grid item xs={4} container direction="row" justifyContent="flex-end" alignItems="flex-start">
          <Grid item>
            {close && <IconButton onClick={close}><Close /></IconButton>}
          </Grid>
        </Grid>
      </Grid>
    </DialogTitle>
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
        <Grid item pt={1} px={1}>
          <CredentialEvidenceWidget credential={credential} />
        </Grid>
      </Grid>
    </DialogContent>
  </Fragment>
})

export type GroupViewParams = EmptyProps & {
  ext: RegovGroupExtension,
  credential: Credential
  close?: () => void
}

export type GroupViewProps = RegovCompoentProps<GroupViewParams>

