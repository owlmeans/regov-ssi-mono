import { BorderColor } from '@mui/icons-material'
import {
  Avatar, ListItem, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText, Typography
} from '@mui/material'
import { EmptyProps, RegovComponetProps, useRegov, withRegov } from '@owlmeans/regov-lib-react'
import { ItemMenu, ItemMenuHandle, MenuIconButton } from '@owlmeans/regov-mold-wallet-web'
import { CredentialWrapper, getCompatibleSubject } from '@owlmeans/regov-ssi-core'
import { Extension, EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED, IncommigDocumentEventParams } from '@owlmeans/regov-ssi-extension'
import React, { Fragment, FunctionComponent, useMemo } from 'react'
import { SignatureSubject } from '../../types'


export const SignatureItemWeb = (ext: Extension): FunctionComponent<SignatureItemParams> =>
  withRegov<SignatureItemProps>({ namespace: ext.localization?.ns }, ({ t, i18n, wrapper, action }) => {
    const { handler, extensions } = useRegov()
    const subject = getCompatibleSubject<SignatureSubject>(wrapper.credential)
    const handle: ItemMenuHandle = useMemo(() => ({ handler: undefined }), [wrapper.credential.id])

    action = action || (async () => {
      if (!extensions || !handler.wallet) {
        return
      }

      await extensions.triggerEvent<IncommigDocumentEventParams>(
        handler.wallet, EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED, {
        credential: wrapper.credential, statusHandler: { successful: false },
        cleanUp: () => undefined
      })
    })

    return <ListItem onClick={action}>
      <ListItemButton>
        <ListItemAvatar>
          <Avatar>
            <BorderColor />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={wrapper.meta.title || t('signature.list.item.unknown')}
          secondary={
            <Fragment>
              <Typography variant="body2" component="span">{subject.name}</Typography>
              <br />
              <Typography variant="caption" component="span">{t('signature.list.item.type')}</Typography>
            </Fragment>
          } />
      </ListItemButton>
      <ListItemIcon>
        <MenuIconButton handle={handle} />
        <ItemMenu handle={handle} content={wrapper.credential} i18n={i18n} prettyOutput
          exportTitle={`${wrapper.meta.title}.signature`} />
      </ListItemIcon>
    </ListItem>
  })

export type SignatureItemParams = EmptyProps & {
  wrapper: CredentialWrapper
  action?: () => void
}

export type SignatureItemProps = RegovComponetProps<SignatureItemParams>