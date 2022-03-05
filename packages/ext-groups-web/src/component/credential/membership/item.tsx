import React, { Fragment, FunctionComponent, useMemo } from 'react'
import { GroupSubject, MembershipSubject, REGOV_CREDENTIAL_TYPE_GROUP } from '@owlmeans/regov-ext-groups'
import { EmptyProps, RegovComponentProps, useRegov, withRegov } from '@owlmeans/regov-lib-react'
import {
  Extension, EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED, IncommigDocumentEventParams
} from '@owlmeans/regov-ssi-extension'
import { CredentialWrapper, Credential, CredentialSubject, getCompatibleSubject } from '@owlmeans/regov-ssi-core'
import { Avatar, ListItem, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material'
import { Person } from '@mui/icons-material'
import { ItemMenu, ItemMenuHandle, MenuIconButton } from '@owlmeans/regov-mold-wallet-web'
import { normalizeValue } from '@owlmeans/regov-ssi-common'


export const MembershipItem = (ext: Extension): FunctionComponent<MembershipItemParams> =>
  withRegov<MembershipItemProps>({ namespace: ext.localization?.ns }, ({ t, i18n, wrapper, action }) => {
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
        <ListItemText primary={wrapper.meta.title || t('group.list.item.unknown')}
          secondary={
            <Fragment>
              <Typography variant="body2" component="span">{groupSubject.name} - {subject.role}</Typography>
              <br />
              <Typography variant="caption" component="span">{t('membership.list.item.type')}</Typography>
            </Fragment>
          } />
      </ListItemButton>
      <ListItemIcon>
        <MenuIconButton handle={handle} />
        <ItemMenu handle={handle} content={wrapper.credential} i18n={i18n} prettyOutput
          exportTitle={`${wrapper.meta.title}.membership`} />
      </ListItemIcon>
    </ListItem>
  })

export type MembershipItemParams = EmptyProps & {
  wrapper: CredentialWrapper<CredentialSubject, Credential<CredentialSubject>>
  action?: () => void
}

export type MembershipItemProps = RegovComponentProps<MembershipItemParams>

