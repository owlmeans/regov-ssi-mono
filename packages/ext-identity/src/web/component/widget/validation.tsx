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
import { Credential, getCompatibleSubject } from '@owlmeans/regov-ssi-core'
import {
  Accordion, AccordionDetails, AccordionSummary, List, ListItem, ListItemAvatar, ListItemButton,
  ListItemText, Typography
} from '@mui/material'
import { Done, ExpandMore, ErrorOutline } from '@mui/icons-material'
import { IdentitySubject, REGOV_IDENTITY_DEFAULT_NAMESPACE } from '../../../types'
import {
  EXTENSION_ITEM_PURPOSE_VALIDATION, ResultWidgetParams, useRegov, ValidationResultWidget
} from '@owlmeans/regov-lib-react'
import { normalizeValue } from '@owlmeans/regov-ssi-core'
import { Extension } from '@owlmeans/regov-ssi-core'
import { EvidenceTrust, EvidenceTrustHandle } from '@owlmeans/regov-lib-react'


export const ValidationWidget = (_: Extension): FunctionComponent<ResultWidgetParams> =>
  (props: ResultWidgetParams) => <ValidationResultWidget ns={props.ns || REGOV_IDENTITY_DEFAULT_NAMESPACE}
    result={props.result} reload={props.reload} com={(props) => {
      const { result, reload, t } = props
      const subject = getCompatibleSubject<IdentitySubject>(result.instance as Credential)
      const { extensions } = useRegov()

      const evidence = normalizeValue(result.result.evidence)

      const handle: EvidenceTrustHandle = { reload }

      return <Fragment>
        <ListItemButton onClick={() => {
          if (!result.instance || !handle.setEvidence) {
            return
          }

          handle.setEvidence(result)
        }}>
          <ListItemAvatar>
            {result.result.trusted && result.result.valid
              ? <Done fontSize="small" color="success" />
              : <ErrorOutline fontSize="small" color="error" />}
          </ListItemAvatar>
          <ListItemText primary={<Typography variant="body2">{`ID: ${subject.identifier}`}</Typography>}
            secondary={<Fragment>
              <Typography variant='caption'>{
                `${t(`widget.validation.main.${result.result.trusted ? 'trusted' : 'untrusted'}`)}`
              }</Typography>
              <Typography variant='caption'>{
                `${t(`widget.validation.main.${result.result.valid ? 'valid' : 'invalid'}`)}`
              }</Typography>
            </Fragment>} />
        </ListItemButton>
        <EvidenceTrust handle={handle} />
        {evidence.length > 0 && <ListItem sx={{ px: 0, mx: 0 }}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle2">{`${t('widget.validation.header.parent')}`}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 0, mx: 0 }}>
              <List>
                {evidence.flatMap((evidence, level) => {
                  const coms = extensions?.produceComponent(EXTENSION_ITEM_PURPOSE_VALIDATION, evidence.type) || []
                  return coms.map((com, idx) => {
                    const Renderer = com.com as FunctionComponent<ResultWidgetParams>
                    return <Renderer key={`key${level}_${idx}`} reload={reload} result={evidence} />
                  })
                })}
              </List>
            </AccordionDetails>
          </Accordion>
        </ListItem>}
      </Fragment>
    }} />