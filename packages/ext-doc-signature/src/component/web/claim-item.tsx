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
import { EmptyProps, RegovComponentProps, useRegov, withRegov, ListItemMeta } from '@owlmeans/regov-lib-react'
import { Extension, normalizeValue } from '@owlmeans/regov-ssi-core'
import { CredentialWrapper } from '@owlmeans/regov-ssi-core'
import { ItemMenu, ItemMenuHandle, MenuIconButton } from '@owlmeans/regov-lib-react'
import { triggerIncommingDocView } from '@owlmeans/regov-comm'
import { REGOV_SIGNATURE_CLAIM_TYPE, SignaturePresentation, SignatureSubject } from '../../types'


import BorderColor from '@mui/icons-material/BorderColor'
import Avatar from '@mui/material/Avatar'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'


export const SignatureClaimItem = (ext: Extension): FunctionComponent<ClaimSignatureItemParams> =>
  withRegov<ClaimSignatureItemProps>({ namespace: ext.localization?.ns }, ({ t, i18n, meta, wrapper, action }) => {
    const signatureClaim = normalizeValue(
      wrapper.credential.verifiableCredential
    ).find(
      cred => cred.type.includes(REGOV_SIGNATURE_CLAIM_TYPE)
    )
    const subject = signatureClaim?.credentialSubject as SignatureSubject
    const { extensions, handler } = useRegov()

    const handle: ItemMenuHandle = useMemo(() => ({ handler: undefined }), [wrapper.credential.id])

    action = action || (
      async () => extensions && handler.wallet
        && await triggerIncommingDocView(extensions.registry, handler.wallet, wrapper)
    )

    return <ListItem>
      <ListItemButton onClick={action}>
        <ListItemAvatar>
          <Avatar>
            <BorderColor />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={wrapper.meta.title || `${t('signature.claim.list.item.unknown')}`}
          secondary={
            <Fragment>
              <Typography variant="body2" component="span">{subject.name}</Typography>
              <br />
              <Typography variant="caption" component="span">{`${t('signature.claim.list.item.type')}`}</Typography>
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

export type ClaimSignatureItemParams = EmptyProps & {
  wrapper: CredentialWrapper<SignatureSubject, SignaturePresentation>
  action?: () => void
  meta?: ListItemMeta
}

export type ClaimSignatureItemProps = RegovComponentProps<ClaimSignatureItemParams>