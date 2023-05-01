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

import React, { Fragment, FunctionComponent, useMemo } from 'react'
import { GroupSubject, MembershipSubject, REGOV_CREDENTIAL_TYPE_GROUP } from '../../../../types'
import { EmptyProps, RegovComponentProps, useRegov, withRegov, ListItemMeta } from '@owlmeans/regov-lib-react'
import {
  Extension, EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED, IncommigDocumentEventParams
} from '@owlmeans/regov-ssi-core'
import { CredentialWrapper, Credential, getCompatibleSubject } from '@owlmeans/regov-ssi-core'
import { ItemMenu, ItemMenuHandle, MenuIconButton } from '@owlmeans/regov-lib-react'
import { normalizeValue } from '@owlmeans/regov-ssi-core'
import Person from '@mui/icons-material/Person'
import Avatar from '@mui/material/Avatar'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'


export const MembershipItem = (ext: Extension): FunctionComponent<MembershipItemParams> =>
  withRegov<MembershipItemProps>({ namespace: ext.localization?.ns }, ({ t, i18n, meta, wrapper, action }) => {
    const subject = getCompatibleSubject<MembershipSubject>(wrapper.credential)
    const { extensions, handler } = useRegov()

    const group = normalizeValue(wrapper.credential.evidence).find(
      evidence => evidence?.type.includes(REGOV_CREDENTIAL_TYPE_GROUP)
    )

    const groupSubject = getCompatibleSubject<GroupSubject>(group as Credential)


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

    return <ListItem>
      <ListItemButton onClick={action}>
        <ListItemAvatar>
          <Avatar>
            <Person />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={wrapper.meta.title || `${t('group.list.item.unknown')}`}
          secondary={
            <Fragment>
              <Typography variant="body2" component="span">{groupSubject.name} - {subject.role}</Typography>
              <br />
              <Typography variant="caption" component="span">{`${t('membership.list.item.type')}`}</Typography>
            </Fragment>
          } />
      </ListItemButton>
      <ListItemIcon>
        <MenuIconButton handle={handle} />
        <ItemMenu handle={handle} content={wrapper.credential} i18n={i18n} prettyOutput
          exportTitle={`${wrapper.meta.title}.membership`} meta={meta} />
      </ListItemIcon>
    </ListItem>
  })

export type MembershipItemParams = EmptyProps & {
  wrapper: CredentialWrapper
  action?: () => void
  meta?: ListItemMeta
}

export type MembershipItemProps = RegovComponentProps<MembershipItemParams>

