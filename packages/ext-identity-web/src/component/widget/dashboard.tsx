import React, {
  Fragment, useState
} from 'react'

import {
  MenuOpen,
  FileDownload,
  ContentCopy
} from '@mui/icons-material'
import {
  CredentialWrapper,
  geCompatibletSubject
} from '@owlmeans/regov-ssi-core'
import {
  EmptyImplProps,
  RegovCompoentProps,
  withRegov
} from '@owlmeans/regov-lib-react'
import {
  Extension
} from '@owlmeans/regov-ssi-extension'
import {
  Grid,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography
} from '@mui/material'
import { IdentitySubject } from '@owlmeans/regov-ext-identity'
import { dateFormatter } from '@owlmeans/regov-mold-wallet-web'
import saveAs from 'file-saver'
import copy from 'copy-to-clipboard'


export const DashboardWidget = (ext: Extension<string>) =>
  withRegov<DashboardWidgetProps>({
    namespace: ext.localization?.ns,
    transformer: (wallet) => {
      return { identityWrap: wallet?.getIdentity() }
    }
  }, (props: DashboardWidgetProps) => {
    const { t, identityWrap } = props
    if (!identityWrap) {
      return <Fragment />
    }
    const subject = geCompatibletSubject<IdentitySubject>(identityWrap.credential)

    const [menuOpened, setMenuOpened] = useState<boolean>(false)
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

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
            <IconButton size="large" color="primary" edge="end" onClick={event => {
              setAnchorEl(event.currentTarget)
              setMenuOpened(true)
            }}>
              <MenuOpen fontSize="inherit" />
            </IconButton>
            {
              /**
               * @OTOD Export as a separate, standard credentiala action component
               */
            }
            <Menu open={menuOpened} anchorEl={anchorEl} onClose={() => setMenuOpened(false)}>
              <MenuItem onClick={() => {
                copy(JSON.stringify(identityWrap.credential), {
                  message: t([`widget.dashboard.clipboard.copyhint`, 'clipboard.copyhint']),
                  format: 'text/plain'
                })
                setMenuOpened(false)
              }}>
                <ListItemIcon>
                  <ContentCopy fontSize="medium" />
                </ListItemIcon>
                <ListItemText primary={t('widget.dashboard.action.copy')} />
              </MenuItem>
              <MenuItem onClick={() => {
                saveAs(new Blob(
                  [JSON.stringify(identityWrap.credential)], { type: "text/plain;charset=utf-8" }
                ), `${identityWrap.meta.title}.identity.json`)
                setMenuOpened(false)
              }}>
                <ListItemIcon>
                  <FileDownload fontSize="medium" />
                </ListItemIcon>
                <ListItemText primary={t('widget.dashboard.action.export')} />
              </MenuItem>
            </Menu>
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

type DashboardWidgetProps = RegovCompoentProps<
  DashboardWidgetParams, EmptyImplProps, DashboardWidgetState
>