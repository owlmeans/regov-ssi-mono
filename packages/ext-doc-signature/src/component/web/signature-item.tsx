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

import { BorderColor } from '@mui/icons-material'
import {
  Avatar, ListItem, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText, Typography
} from '@mui/material'
import { EmptyProps, RegovComponentProps, useRegov, withRegov } from '@owlmeans/regov-lib-react'
import { ItemMenu, ItemMenuHandle, MenuIconButton, ListItemMeta } from '@owlmeans/regov-lib-react'
import { CredentialWrapper, getCompatibleSubject } from '@owlmeans/regov-ssi-core'
import { Extension, EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED, IncommigDocumentEventParams } from '@owlmeans/regov-ssi-core'
import React, { Fragment, FunctionComponent, useMemo, useEffect } from 'react'
import { SignatureSubject } from '../../types'


export const SignatureItemWeb = (ext: Extension): FunctionComponent<SignatureItemParams> =>
  withRegov<SignatureItemProps>({ namespace: ext.localization?.ns }, ({
    t, i18n, meta, wrapper, action, trigger
  }) => {
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
              <Typography variant="body2" component="span">{subject.name}</Typography>
              <br />
              <Typography variant="caption" component="span">{t('signature.list.item.type')}</Typography>
            </Fragment>
          } />
      </ListItemButton>
      <ListItemIcon>
        <MenuIconButton handle={handle} />
        <ItemMenu handle={handle} content={wrapper.credential} i18n={i18n} prettyOutput
          exportTitle={`${wrapper.meta.title}.signature`} meta={meta}/>
      </ListItemIcon>
    </ListItem>
  })

export type SignatureItemParams = EmptyProps & {
  wrapper: CredentialWrapper
  action?: () => void
  trigger?: boolean
  meta?: ListItemMeta
}

export type SignatureItemProps = RegovComponentProps<SignatureItemParams>