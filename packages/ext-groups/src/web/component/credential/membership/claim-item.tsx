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

import { Fragment, FunctionComponent, useMemo } from 'react'
import { MembershipSubject, REGOV_CREDENTIAL_TYPE_MEMBERSHIP } from '../../../../types'
import { Extension, EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED, normalizeValue, UnsignedCredential } from '@owlmeans/regov-ssi-core'
import { CredentialWrapper, Presentation } from '@owlmeans/regov-ssi-core'
import { EmptyProps, RegovComponentProps, useRegov, withRegov, ListItemMeta } from '@owlmeans/regov-lib-react'
import { ItemMenu, ItemMenuHandle, MenuIconButton } from '@owlmeans/regov-lib-react'
import { IncommigDocumentWithConn } from '@owlmeans/regov-comm'
import Person from '@mui/icons-material/Person'

import Avatar from '@mui/material/Avatar'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'


export const MembershipClaimItem = (ext: Extension): FunctionComponent<MembershipClaimItemParams> =>
  withRegov<MembershipClaimItemProps>({ namespace: ext.localization?.ns }, ({ t, i18n, meta, wrapper, action }) => {
    const membershipClaim = normalizeValue(
      wrapper.credential.verifiableCredential
    ).find(
      cred => cred.type.includes(REGOV_CREDENTIAL_TYPE_MEMBERSHIP)
    )
    const subject = membershipClaim?.credentialSubject as MembershipSubject
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
            <Person />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={wrapper.meta.title || `${t('membership.claim.list.item.unknown')}`}
          secondary={
            <Fragment>
              <Typography variant="body2" component="span">{subject.role}</Typography>
              <br />
              <Typography variant="caption" component="span">{`${t('membership.claim.list.item.type')}`}</Typography>
            </Fragment>
          } />
      </ListItemButton>
      <ListItemIcon>
        <MenuIconButton handle={handle} />
        <ItemMenu handle={handle} content={wrapper.credential} i18n={i18n} prettyOutput
          exportTitle={`${wrapper.meta.title}.membership`} meta={meta}/>
      </ListItemIcon>
    </ListItem>
  })

export type MembershipClaimItemParams = EmptyProps & {
  wrapper: CredentialWrapper<MembershipSubject, Presentation<UnsignedCredential<MembershipSubject>>>
  action?: () => void
  meta?: ListItemMeta
}

export type MembershipClaimItemProps = RegovComponentProps<MembershipClaimItemParams>