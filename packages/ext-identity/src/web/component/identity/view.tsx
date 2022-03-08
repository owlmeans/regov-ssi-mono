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

import React, { Fragment, FunctionComponent, useEffect, useState } from 'react'
import { 
  CredentialEvidenceWidget, EmptyProps, EntityRenderer, RegovComponentProps, useRegov,
  ValidationResultWidgetWeb, withRegov 
} from '@owlmeans/regov-lib-react'
import {
  Button, DialogActions, DialogContent, DialogTitle, Grid, IconButton, Paper, Typography
} from '@mui/material'
import {
  Credential, getCompatibleSubject, REGISTRY_SECTION_OWN, REGISTRY_SECTION_PEER,
  REGISTRY_TYPE_IDENTITIES
} from '@owlmeans/regov-ssi-core'
import { Close } from '@mui/icons-material'
import { ValidationResult, VALIDATION_FAILURE_CHECKING } from '@owlmeans/regov-ssi-core'
import { RegovIdentityExtension, IdentitySubject } from '../../../types'
import { REGOV_IDENTITY_DEFAULT_NAMESPACE } from '../../types'


export const IdentityView: FunctionComponent<IdentityViewParams> = withRegov<IdentityViewProps>({
  namespace: REGOV_IDENTITY_DEFAULT_NAMESPACE
}, ({ t, credential, close, ext }) => {
  const subject = getCompatibleSubject<IdentitySubject>(credential)
  const factory = ext.getFactory(credential.type)
  const { handler, extensions } = useRegov()
  const [counter, setCounter] = useState<number>(0)

  const registry = handler.wallet?.getRegistry(REGISTRY_TYPE_IDENTITIES)
  const credentialWrapper =
    registry?.getCredential(credential.id, REGISTRY_SECTION_OWN)
      || registry?.getCredential(credential.id, REGISTRY_SECTION_PEER)

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

  return <Fragment>
    <DialogTitle>
      <Grid container direction="row" justifyContent="space-between" alignItems="flex-start">
        <Grid item xs={8}>
          {credentialWrapper?.meta?.title || t('identity.view.title')}
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
              <EntityRenderer t={t} entity="identity" title={
                <Fragment>
                  <Grid item px={1}>
                    <Typography variant='overline'>{t('identity.view.identifier')}: {subject.identifier}</Typography>
                  </Grid>
                  <Grid item px={1}>
                    <Typography variant='overline'>{t('identity.view.sourceApp')}: {subject.sourceApp}</Typography>
                  </Grid>
                  <Grid item px={1}>
                    <Typography variant='overline'>{t('identity.view.uuid')}: {subject.uuid}</Typography>
                  </Grid>
                  <Grid item px={1}>
                    <Typography variant='overline'>{t('identity.view.createdAt')}: {subject.createdAt}</Typography>
                  </Grid>
                </Fragment>
              } subject={subject} />
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
      {result.trusted && <Button onClick={() => close && close()}>{t('identity.view.close')}</Button>}
    </DialogActions>
  </Fragment>
})

export type IdentityViewParams = EmptyProps & {
  ext: RegovIdentityExtension,
  credential: Credential
  close?: () => void
}

export type IdentityViewProps = RegovComponentProps<IdentityViewParams>

