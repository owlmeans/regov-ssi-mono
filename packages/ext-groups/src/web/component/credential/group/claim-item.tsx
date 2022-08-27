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

import React, { Fragment, FunctionComponent, useMemo } from 'react'
import { GroupSubject, IncommigDocumentWithConn, REGOV_CREDENTIAL_TYPE_GROUP } from '../../../../types'
import { EmptyProps, RegovComponentProps, useRegov, withRegov, ListItemMeta } from '@owlmeans/regov-lib-react'
import { Extension, EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED, Presentation, normalizeValue } from '@owlmeans/regov-ssi-core'
import { CredentialWrapper, UnsignedCredential } from '@owlmeans/regov-ssi-core'
import { ItemMenu, ItemMenuHandle, MenuIconButton } from '@owlmeans/regov-lib-react'
import Groups from '@mui/icons-material/Groups'

import Avatar from '@mui/material/Avatar'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'


export const GroupClaimItem = (ext: Extension): FunctionComponent<ClaimGroupItemParams> =>
  withRegov<ClaimGroupItemProps>({ namespace: ext.localization?.ns }, ({ t, i18n, meta, wrapper, action }) => {
    const groupClaim = normalizeValue(
      wrapper.credential.verifiableCredential
    ).find(
      cred => cred.type.includes(REGOV_CREDENTIAL_TYPE_GROUP)
    )
    const subject = groupClaim?.credentialSubject as GroupSubject
    const { extensions, handler } = useRegov()

    const handle: ItemMenuHandle = useMemo(() => ({ handler: undefined }), [wrapper.credential.id])

    action = action || (async () => {
      if (!extensions || !handler.wallet) {
        return
      }

      await extensions.triggerEvent<IncommigDocumentWithConn>(
        handler.wallet, EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED, {
        credential: wrapper.credential as any, statusHandler: { successful: false },
        conn: (wrapper.meta as unknown as IncommigDocumentWithConn).conn,
        cleanUp: () => undefined
      })
    })

    return <ListItem>
      <ListItemButton onClick={action}>
        <ListItemAvatar>
          <Avatar>
            <Groups />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={wrapper.meta.title || `${t('group.claim.list.item.unknown')}`}
          secondary={
            <Fragment>
              <Typography variant="body2" component="span">{subject.name}</Typography>
              <br />
              <Typography variant="caption" component="span">{`${t('group.claim.list.item.type')}`}</Typography>
            </Fragment>
          } />
      </ListItemButton>
      <ListItemIcon>
        <MenuIconButton handle={handle} />
        <ItemMenu handle={handle} content={wrapper.credential} i18n={i18n} prettyOutput
          exportTitle={`${wrapper.meta.title}.group`} meta={meta} />
      </ListItemIcon>
    </ListItem>
  })

export type ClaimGroupItemParams = EmptyProps & {
  wrapper: CredentialWrapper<GroupSubject, Presentation<UnsignedCredential<GroupSubject>>>
  action?: () => void
  meta?: ListItemMeta
}

export type ClaimGroupItemProps = RegovComponentProps<ClaimGroupItemParams>