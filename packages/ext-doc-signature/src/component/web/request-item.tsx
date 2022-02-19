import { BorderColor } from '@mui/icons-material'
import {
  Avatar, ListItem, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText, Typography
} from '@mui/material'
import { EmptyProps, RegovComponentProps, useRegov, withRegov } from '@owlmeans/regov-lib-react'
import { ItemMenu, ItemMenuHandle, MenuIconButton } from '@owlmeans/regov-mold-wallet-web'
import { MaybeArray } from '@owlmeans/regov-ssi-common'
import { CredentialWrapper, getCompatibleSubject, Credential, Presentation, CredentialSubject } from '@owlmeans/regov-ssi-core'
import { Extension, EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED, IncommigDocumentEventParams } from '@owlmeans/regov-ssi-extension'
import React, { Fragment, FunctionComponent, useEffect, useMemo } from 'react'
import { SignatureRequestSubject } from '../../types'
import { getSignatureRequestFromPresentation } from '../../util'


export const SignatureRequestItemWeb = (ext: Extension): FunctionComponent<SignatureRequestItemParams> =>
  withRegov<SignatureRequestItemProps>({ namespace: ext.localization?.ns },
    ({ t, i18n, wrapper, action, trigger }) => {
      const { handler, extensions } = useRegov()
      const subject = getCompatibleSubject<SignatureRequestSubject>(
        getSignatureRequestFromPresentation(wrapper.credential) as Credential
      )
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

      useEffect(() => { trigger && action && action() }, [trigger, wrapper.credential.id])

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
                <Typography variant="body2" component="span">{subject.documentHash}</Typography>
                <br />
                <Typography variant="caption" component="span">{t('signature.request.item.type')}</Typography>
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

export type SignatureRequestItemParams = EmptyProps & {
  wrapper: CredentialWrapper<MaybeArray<CredentialSubject>, Presentation>
  action?: () => void
  trigger?: boolean
}

export type SignatureRequestItemProps = RegovComponentProps<SignatureRequestItemParams>