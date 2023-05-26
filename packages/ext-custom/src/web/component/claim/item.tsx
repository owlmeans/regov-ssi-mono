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

import { Fragment, FunctionComponent } from 'react'
import { CredentialWrapper, getDeepValue } from '@owlmeans/regov-ssi-core'
import { useTranslation } from 'react-i18next'
import { EmptyProps, ListItemMeta, useRegov } from '@owlmeans/regov-lib-react'
import { triggerIncommingDocView } from '@owlmeans/regov-comm'
import { getSubject } from '../../utils/cred'
import { castSectionKey } from '../../utils/tools'
import { CustomDescription, DefaultPresentation, DefaultSubject, UseFieldAt } from '../../../custom.types'

import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'


export const ClaimItem = (descr: CustomDescription<DefaultSubject>): FunctionComponent<ClaimItemProps> =>
  ({ wrapper, action }) => {
    const { t } = useTranslation(descr.ns)
    const sectionKey = castSectionKey(descr)
    const { extensions, handler } = useRegov()

    action = action || (
      async () => extensions && handler.wallet
        && await triggerIncommingDocView(extensions.registry, handler.wallet, wrapper)
    )

    return <ListItem>
      <ListItemButton onClick={action}>
        <ListItemText primary={wrapper.meta.title || `${t(`${sectionKey}.claim.list.item.unknown`)}`}
          secondary={<Fragment>
            {Object.entries(descr.subjectMeta).filter(
              ([, field]) => field.useAt.includes(UseFieldAt.CLAIM_ITEM)
            ).map(([key]) => {
              return <Typography key={key} variant="body2" component="span">
                {t(`${sectionKey}.${UseFieldAt.CLAIM_ITEM}.${key}.label`)}: {`${getDeepValue(getSubject(descr, wrapper.credential), key)}`}
              </Typography>
            })}
          </Fragment>} />
      </ListItemButton>
    </ListItem>
  }

export type ClaimItemProps = EmptyProps & {
  wrapper: CredentialWrapper<DefaultSubject, DefaultPresentation>
  action?: () => void
  meta?: ListItemMeta
}