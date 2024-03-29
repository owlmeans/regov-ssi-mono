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

import { Fragment, FunctionComponent, useEffect, useState } from 'react'
import {
  CredentialEvidenceWidget, EmptyProps, RegovComponentProps, useRegov, withRegov
} from '@owlmeans/regov-lib-react'
import {
  REGOV_EXT_GROUP_NAMESPACE, RegovGroupExtension, GroupSubject, REGOV_CREDENTIAL_TYPE_GROUP
} from '../../../../types'
import { Credential, getCompatibleSubject } from '@owlmeans/regov-ssi-core'
import { EntityRenderer, EntityTextRenderer, ValidationResultWidgetWeb } from '@owlmeans/regov-lib-react'
import { ValidationResult, VALIDATION_FAILURE_CHECKING } from '@owlmeans/regov-ssi-core'
import { MembershipClaim } from '../membership'
import Close from '@mui/icons-material/Close'
import People from '@mui/icons-material/People'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'


export const GroupView: FunctionComponent<GroupViewParams> = withRegov<GroupViewProps>({
  namespace: REGOV_EXT_GROUP_NAMESPACE
}, ({ t, credential, close, ext }) => {
  const subject = getCompatibleSubject<GroupSubject>(credential)
  const factory = ext.getFactory(REGOV_CREDENTIAL_TYPE_GROUP)
  const { handler, extensions } = useRegov()
  const [counter, setCounter] = useState<number>(0)

  const reload = () => setCounter(counter + 1)

  const [result, setValidationResult] = useState<ValidationResult>({
    valid: false,
    trusted: false,
    cause: VALIDATION_FAILURE_CHECKING,
    evidence: []
  })

  useEffect(() => {
    (async () => {
      if (!handler.wallet || !extensions) {
        return
      }
      const res = await factory.validate(handler.wallet, {
        credential, extensions: extensions.registry
      })
      setValidationResult(res)
    })()
  }, [subject.uuid, counter])

  const [claimMembership, setClaimMembership] = useState<boolean>(false)

  return <Fragment>
    <DialogTitle>
      <Grid container direction="row" justifyContent="space-between" alignItems="flex-start">
        <Grid item xs={8}>
          {`${t('group.view.title', { name: subject.name })}`}
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
        <Grid item container direction="row" justifyContent="space-between" alignItems="stretch">
          <Grid item xs={12} sm={6} md={7} px={1}>
            <Paper elevation={3}>
              <EntityRenderer t={t} entity="group" title={
                <Fragment>
                  <Grid container direction="row" spacing={1} justifyContent="flex-start" alignItems="flex-start">
                    <Grid item>
                      <People fontSize="large" />
                    </Grid>
                    <Grid item>{subject.name}</Grid>
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
              <ValidationResultWidgetWeb result={result} reload={reload} />
            </Paper>
          </Grid>
        </Grid>
        <Grid item pt={1} px={1}>
          <CredentialEvidenceWidget credential={credential} />
        </Grid>
      </Grid>
    </DialogContent>
    <DialogActions>
      {result.trusted && <Button onClick={() => setClaimMembership(true)}>
        {`${t('group.view.claimMembership')}`}
      </Button>}
    </DialogActions>
    <Dialog open={claimMembership} fullWidth onClose={() => setClaimMembership(false)} scroll="paper">
      <MembershipClaim ext={ext} group={credential}
        close={() => setClaimMembership(false)}
        finish={() => close && close()}
      />
    </Dialog>
  </Fragment>
})

export type GroupViewParams = EmptyProps & {
  ext: RegovGroupExtension,
  credential: Credential
  close?: () => void
}

export type GroupViewProps = RegovComponentProps<GroupViewParams>

