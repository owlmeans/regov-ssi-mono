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

import React, { Fragment, FunctionComponent } from 'react'
import {
  EmptyProps, RegovComponentProps, useRegov, withRegov, EXTENSION_ITEM_PURPOSE_VALIDATION,
  ResultWidgetParams
} from '../../../../common'
import { ValidationResult } from '@owlmeans/regov-ssi-core'
import { normalizeValue } from '@owlmeans/regov-ssi-core'
import { EvidenceTrust, EvidenceTrustHandle } from './evidence/'
import Done from '@mui/icons-material/Done'
import ErrorOutline from '@mui/icons-material/ErrorOutline'
import ExpandMore from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Avatar from '@mui/material/Avatar'
import List from '@mui/material/List'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListSubheader from '@mui/material/ListSubheader'
import Typography from '@mui/material/Typography'


export const ValidationResultWidgetWeb: FunctionComponent<ResultWidgetParamsWeb> = withRegov<ResultWidgetPropsWeb>({
  namespace: 'regov-wallet-credential'
}, ({ t, reload, result }) => {
  const { extensions } = useRegov()
  const handle: EvidenceTrustHandle = { reload }

  return <Fragment>
    <List subheader={<ListSubheader disableSticky>
      <Typography variant="subtitle1">{`${t('widget.validation.header.title')}`}</Typography>
    </ListSubheader>}>
      <ListItemButton onClick={() => {
        if (!result.instance || !handle.setResult) {
          return
        }
        handle.setResult(result, result.instance)
      }}>
        <ListItemAvatar>
          <Avatar>
            {result.trusted && result.valid
              ? <Done color="success" />
              : <ErrorOutline color="error" />}
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={`${t(`widget.validation.main.${result.trusted ? 'trusted' : 'untrusted'}`)}`}
          secondary={`${t(`widget.validation.main.${result.valid ? 'valid' : 'invalid'}`)}`} />
      </ListItemButton>
      <EvidenceTrust handle={handle} />
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle2">{`${t('widget.validation.header.parent')}`}</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 0, mx: 0 }}>
          <List>
            {normalizeValue(result.evidence).flatMap((result, level) => {
              const coms = extensions?.produceComponent(EXTENSION_ITEM_PURPOSE_VALIDATION, result.instance?.type) || []
              return coms.map((com, idx) => {
                const Renderer = com.com as FunctionComponent<ResultWidgetParams>
                return <Renderer key={`key${level}_${idx}`} reload={reload} result={result} />
              })
            })}
          </List>
        </AccordionDetails>
      </Accordion>
    </List>
  </Fragment>
})

export type ResultWidgetParamsWeb = EmptyProps & {
  result: ValidationResult
  reload?: () => void
}

export type ResultWidgetPropsWeb = RegovComponentProps<ResultWidgetParamsWeb>