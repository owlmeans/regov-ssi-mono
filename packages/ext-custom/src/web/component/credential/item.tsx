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

import React, { Fragment, FunctionComponent, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CustomDescription, DefaultPresentation, DefaultSubject, UseFieldAt } from '../../../custom.types'

// import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import { CredentialWrapper, getDeepValue } from '@owlmeans/regov-ssi-core'
import { ItemMenu, ItemMenuHandle, ListItemMeta, MenuIconButton, useRegov } from '@owlmeans/regov-lib-react'
import { castSectionKey } from '../../utils/tools'
import Typography from '@mui/material/Typography'
import { getSubject } from '../../utils/cred'
import ListItemIcon from '@mui/material/ListItemIcon'
import { triggerIncommingDocView } from '@owlmeans/regov-comm'


export const CredentialItem = (descr: CustomDescription<DefaultSubject>): FunctionComponent<CredentialItemProps> =>
  ({ action, wrapper, meta, trigger }) => {
    const { t, i18n } = useTranslation(descr.ns)
    const sectionKey = castSectionKey(descr)
    const { extensions, handler } = useRegov()
    const handle: ItemMenuHandle = useMemo(() => ({ handler: undefined }), [wrapper.credential.id])

    action = action || (
      async () => extensions && handler.wallet
        && await triggerIncommingDocView(extensions.registry, handler.wallet, wrapper)
    )

    useEffect(() => { trigger && action && action() }, [trigger, wrapper.credential.id])

    return <ListItemButton>
      <ListItemText onClick={action} primary={wrapper.meta.title || `${t(`${sectionKey}.cred.list.item.unknown`)}`}
        secondary={<Fragment>
          {Object.entries(descr.subjectMeta).filter(
            ([, field]) => field.useAt.includes(UseFieldAt.CRED_ITEM)
          ).map(([key]) => {
            return <Typography key={key} variant="body2" component="span">
              {t(`${sectionKey}.${UseFieldAt.CRED_ITEM}.${key}`)}: {`${getDeepValue(getSubject(descr, wrapper.credential), key)}`}
            </Typography>
          })}
        </Fragment>} />
      <ListItemIcon>
        <MenuIconButton handle={handle} />
        <ItemMenu handle={handle} content={wrapper.credential} i18n={i18n} prettyOutput
          exportTitle={`${wrapper.meta.title}.signature`} meta={meta} />
      </ListItemIcon>
    </ListItemButton>
  }

export type CredentialItemProps = {
  wrapper: CredentialWrapper<DefaultSubject, DefaultPresentation>
  action?: () => void
  trigger?: boolean
  meta?: ListItemMeta
}