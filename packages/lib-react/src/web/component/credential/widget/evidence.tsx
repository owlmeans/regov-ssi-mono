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

import React, { Fragment, FunctionComponent, useState } from 'react'
import {
  Accordion, AccordionDetails, AccordionSummary, Card, CardContent, CardHeader, Grid,
  Tab, Tabs, Typography, Divider
} from '@mui/material'
import {
  CredentialEvidenceWidget, EvidenceWidgetImplProps, EXTENSION_ITEM_PURPOSE_EVIDENCE,
  PurposeEvidenceWidgetParams, useRegov
} from '../../../../common'
import { CredentialWrapper, Credential } from '@owlmeans/regov-ssi-core'
import { StandardEvidenceWidget } from './evidence/'
import { ExpandMore } from '@mui/icons-material'


export const CredentialEvidenceWidgetWeb = (props: EvidenceWidgetImplProps) => {
  const { t, tabs, isChild } = props
  const { extensions } = useRegov()

  const [tabIdx, setTab] = useState<number>(0)
  const tab = tabs[tabIdx]

  const renderers = extensions?.produceComponent(EXTENSION_ITEM_PURPOSE_EVIDENCE, tab.evidence.type)
  const renderer = renderers && renderers[0]
  const Renderer = (renderer?.com || StandardEvidenceWidget) as FunctionComponent<PurposeEvidenceWidgetParams>

  return <Card>
    <CardHeader title={!isChild && `${t('widget.evidence.header.title')}`}
      subheader={<Fragment>
        <Tabs value={tabIdx} onChange={(_, tabIdx) => setTab(tabIdx)}>
          {tabs.map(tab => <Tab key={`${tab.idx}`} value={tab.idx} label={tab.title} />)}
        </Tabs>
        <Divider />
      </Fragment>} />
    <CardContent sx={{ px: 0, mx: 0 }}>
      <Grid container direction="column" justifyContent="flex-start" alignItems="stretch">
        {<Grid item sx={{ px: 1 }}>
          <Renderer wrapper={{
            credential: tab.evidence, meta: { secure: false, title: tab.title }
          } as CredentialWrapper} />
        </Grid>}
        {tab.evidence.evidence && <Grid item>
          <Accordion TransitionProps={{ unmountOnExit: true }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography>{`${t('widget.evidence.accordion.summary')}`}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 0, mx: 0 }}>
              <CredentialEvidenceWidget isChild credential={tab.evidence as Credential} />
            </AccordionDetails>
          </Accordion>
        </Grid>}
      </Grid>
    </CardContent>
  </Card >
}