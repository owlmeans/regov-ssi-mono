import {
  EmptyProps, ItemMenu, ItemMenuHandle, ListItemMeta, MenuIconButton, RegovComponentProps,
  useRegov, withRegov
} from "@owlmeans/regov-lib-react"
import {
  CredentialWrapper, Extension, IncommigDocumentEventParams, Presentation, Credential,
  EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED,
  singleValue
} from "@owlmeans/regov-ssi-core"
import { Fragment, FunctionComponent, useEffect, useMemo } from "react"

import BorderColor from '@mui/icons-material/BorderColor'
import Avatar from '@mui/material/Avatar'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import { AuthSubject } from "../../../../types"


export const AuthRequestItem = (ext: Extension): FunctionComponent =>
  withRegov<SignatureRequestItemProps>({ namespace: ext.localization?.ns },
    ({ t, i18n, meta, wrapper, action, trigger }) => {
      const { handler, extensions } = useRegov()
      const handle: ItemMenuHandle = useMemo(() => ({ handler: undefined }), [wrapper.credential.id])

      const presentation = wrapper.credential as Presentation<Credential<AuthSubject>>
      const credential = singleValue(presentation.verifiableCredential) as Credential<AuthSubject>
      const subject = credential.credentialSubject

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
          <ListItemText primary={wrapper.meta.title || `${t('auth.request.list.item.unknown')}`}
            secondary={
              <Fragment>
                <Typography variant="body2" component="span">
                  {`${t('auth.request.list.item.title', { did: subject.did })}`}
                </Typography>
                <br />
                <Typography variant="caption" component="span">{`${t('auth.request.list.item.type')}`}</Typography>
              </Fragment>
            } />
        </ListItemButton>
        <ListItemIcon>
          <MenuIconButton handle={handle} />
          <ItemMenu handle={handle} content={wrapper.credential} i18n={i18n} prettyOutput
            exportTitle={`${wrapper.meta.title}.auth`} meta={meta} />
        </ListItemIcon>
      </ListItem>
    })


export type AuthRequestItemParams = EmptyProps & {
  wrapper: CredentialWrapper<{}, Presentation>
  action?: () => void
  trigger?: boolean
  meta?: ListItemMeta
}

export type SignatureRequestItemProps = RegovComponentProps<AuthRequestItemParams>