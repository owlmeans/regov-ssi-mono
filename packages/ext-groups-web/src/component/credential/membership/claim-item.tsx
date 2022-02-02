import React, { Fragment, FunctionComponent, useMemo } from 'react'
import { Avatar, ListItem, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material'
import { MembershipSubject, RegovGroupClaim } from '@owlmeans/regov-ext-groups'
import { Extension, EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED, IncommigDocumentEventParams } from '@owlmeans/regov-ssi-extension'
import { Credential, CredentialSubject, CredentialWrapper, getCompatibleSubject, Presentation } from '@owlmeans/regov-ssi-core'
import { EmptyProps, RegovComponetProps, useRegov, withRegov } from '@owlmeans/regov-lib-react'
import { Person } from '@mui/icons-material'
import { ItemMenu, ItemMenuHandle, MenuIconButton } from '@owlmeans/regov-mold-wallet-web'


export const MembershipClaimItem = (ext: Extension<RegovGroupClaim>): FunctionComponent<ClaimItemParams> =>
  withRegov<ClaimItemProps>({ namespace: ext.localization?.ns }, ({ t, i18n, wrapper, action }) => {
    const { extensions, handler } = useRegov()
    const presentation = wrapper.credential as Presentation
    const subject = getCompatibleSubject<MembershipSubject>(presentation.verifiableCredential[0])

    const handle: ItemMenuHandle = useMemo(() => ({ handler: undefined }), [presentation.id])

    action = action || (async () => {
      if (!extensions || !handler.wallet) {
        return
      }

      await extensions.triggerEvent<IncommigDocumentEventParams<string>>(
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
          exportTitle={`${wrapper.meta.title}.group`} />
      </ListItemIcon>
    </ListItem>
  })

export type ClaimItemParams = EmptyProps & {
  wrapper: CredentialWrapper<CredentialSubject, Presentation<Credential<CredentialSubject>>>
  action?: () => void
}

export type ClaimItemProps = RegovComponetProps<ClaimItemParams>