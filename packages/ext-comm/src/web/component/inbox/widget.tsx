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

import { Fragment, FunctionComponent } from "react"
import { CredentialList, EmptyProps, RegovComponentProps, withRegov } from "@owlmeans/regov-lib-react"
import { Extension, REGISTRY_SECTION_PEER } from "@owlmeans/regov-ssi-core"
import { REGISTRY_TYPE_INBOX } from "../../../types"

import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Close from '@mui/icons-material/Close'


export const InboxWidget = (ext: Extension): FunctionComponent<InboxWidgetParams> =>
  withRegov<InboxWidgetProps>({ namespace: ext.localization?.ns }, props => {
    const { close, t } = props

    return <Fragment>
      <DialogTitle>
      <Grid container direction="row" justifyContent="space-between" alignItems="flex-start">
        <Grid item xs={8}>
          {`${t('inbox.widget.title')}`}
        </Grid>
        <Grid item xs={4} container direction="row" justifyContent="flex-end" alignItems="flex-start">
          <Grid item>
            {close && <IconButton onClick={close}><Close /></IconButton>}
          </Grid>
        </Grid>
      </Grid>
    </DialogTitle>
      <DialogContent>
        <CredentialList tab={REGISTRY_TYPE_INBOX} section={REGISTRY_SECTION_PEER} tabs={[{
          name: REGISTRY_TYPE_INBOX,
          registry: {
            type: REGISTRY_TYPE_INBOX,
            defaultSection: REGISTRY_SECTION_PEER,
            allowPeer: false,
          }
        }]} ns={ext.localization?.ns} />
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>{`${t('inbox.widget.close')}`}</Button>
      </DialogActions>
    </Fragment>
  })


export type InboxWidgetParams = EmptyProps & {
  close: () => void
}

export type InboxWidgetProps = RegovComponentProps<InboxWidgetParams>