import React, { Fragment, FunctionComponent } from "react"
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