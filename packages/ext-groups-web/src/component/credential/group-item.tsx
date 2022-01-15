import React, {
  Fragment, FunctionComponent
} from 'react'
import { GroupSubject, RegovGroupCredential } from '@owlmeans/regov-ext-groups'
import {
  EmptyProps,
  RegovCompoentProps,
  withRegov
} from '@owlmeans/regov-lib-react'
import { Extension } from '@owlmeans/regov-ssi-extension'
import {
  CredentialWrapper,
  Credential,
  CredentialSubject,
  geCompatibletSubject
} from '@owlmeans/regov-ssi-core'
import {
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography
} from '@mui/material'
import {
  Groups
} from '@mui/icons-material'


export const GroupItem = (ext: Extension<RegovGroupCredential>): FunctionComponent<GroupItemParams> =>
  withRegov<GroupItemProps>({ namespace: ext.localization?.ns }, ({ t, wrapper, action }) => {
    const subject = geCompatibletSubject<GroupSubject>(wrapper.credential)

    return <ListItem button onClick={action}>
      <ListItemAvatar>
        <Avatar>
          <Groups />
        </Avatar>
      </ListItemAvatar>
      <ListItemText primary={wrapper.meta.title || t('group.list.item.unknown')}
        secondary={
          <Fragment>
            <Typography variant="body2">{subject.name}</Typography>
            <Typography variant="caption">{t('group.list.item.type')}</Typography>
          </Fragment>
        } />
    </ListItem>
  })

export type GroupItemParams = EmptyProps & {
  wrapper: CredentialWrapper<CredentialSubject, Credential<CredentialSubject>>
  action?: () => void
}

export type GroupItemProps = RegovCompoentProps<GroupItemParams>

