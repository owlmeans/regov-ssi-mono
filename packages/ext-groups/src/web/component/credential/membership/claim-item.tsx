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

import React, { Fragment, FunctionComponent, useEffect, useMemo } from 'react'
import { Avatar, ListItem, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material'
import { MembershipSubject } from '../../../../types'
import { Extension, EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED, IncommigDocumentEventParams } from '@owlmeans/regov-ssi-core'
import { Credential, CredentialSubject, CredentialWrapper, getCompatibleSubject, Presentation } from '@owlmeans/regov-ssi-core'
import { EmptyProps, RegovComponentProps, useRegov, withRegov, ListItemMeta } from '@owlmeans/regov-lib-react'
import { Person } from '@mui/icons-material'
import { ItemMenu, ItemMenuHandle, MenuIconButton } from '@owlmeans/regov-lib-react'


export const MembershipClaimItem = (ext: Extension): FunctionComponent<ClaimItemParams> =>
  withRegov<ClaimItemProps>({ namespace: ext.localization?.ns }, ({ t, i18n, meta, wrapper, trigger, action }) => {
    const { extensions, handler } = useRegov()
    const presentation = wrapper.credential as Presentation
    const subject = getCompatibleSubject<MembershipSubject>(presentation.verifiableCredential[0])

    const handle: ItemMenuHandle = useMemo(() => ({ handler: undefined }), [presentation.id])

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

    return <ListItem>
      <ListItemButton onClick={action}>
        <ListItemAvatar>
          <Avatar>
            <Person />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={wrapper.meta.title || t('membership.claim.list.item.unknown')}
          secondary={
            <Fragment>
              <Typography variant="body2" component="span">{subject.role}</Typography>
              <br />
              <Typography variant="caption" component="span">{t('membership.claim.list.item.type')}</Typography>
            </Fragment>
          } />
      </ListItemButton>
      <ListItemIcon>
        <MenuIconButton handle={handle} />
        <ItemMenu handle={handle} content={wrapper.credential} i18n={i18n} prettyOutput
          exportTitle={`${wrapper.meta.title}.group`} meta={meta}/>
      </ListItemIcon>
    </ListItem>
  })

export type ClaimItemParams = EmptyProps & {
  wrapper: CredentialWrapper<CredentialSubject, Presentation<Credential<CredentialSubject>>>
  action?: () => void
  trigger?: boolean
  meta?: ListItemMeta
}

export type ClaimItemProps = RegovComponentProps<ClaimItemParams>