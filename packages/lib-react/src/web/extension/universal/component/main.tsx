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

import React from 'react'
import { Box, Divider, Tab, Tabs } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { withRegov } from '../../../../common'
import { UNIVERSAL_EXTENSION_SCREEN_PATH } from '../types'
import { Extension } from '@owlmeans/regov-ssi-core'
import {
  MainBuilder, MainSigner, MainClaimer, MainProposer, MainRequester, MainResponder, MainReader
} from './main/'


export const Main = (ext: Extension) => {

  return withRegov({ namespace: ext.localization?.ns }, ({ t }) => {
    const { tab } = useParams()
    const navigate = useNavigate()

    return <Box>
      <Box>
        <Tabs value={tab} onChange={(_, tab) => navigate(`${UNIVERSAL_EXTENSION_SCREEN_PATH}/${tab}`)}
          variant="scrollable" scrollButtons="auto">
          <Tab label={t('tab.read.label')} value="read" />
          <Tab label={t('tab.build.label')} value="build" />
          <Tab label={t('tab.sign.label')} value="sign" />
          <Tab label={t('tab.claim.label')} value="claim" />
          <Tab label={t('tab.offer.label')} value="offer" />
          <Tab label={t('tab.request.label')} value="request" />
          <Tab label={t('tab.response.label')} value="response" />
        </Tabs>
        <Divider />
      </Box>
      {tab === 'read' && <Box><MainReader ext={ext} /></Box>}
      {tab === 'build' && <Box><MainBuilder ext={ext} /></Box>}
      {tab === 'sign' && <Box><MainSigner ext={ext} /></Box>}
      {tab === 'claim' && <Box><MainClaimer ext={ext} /></Box>}
      {tab === 'offer' && <Box><MainProposer ext={ext} /></Box>}
      {tab === 'request' && <Box><MainRequester ext={ext} /></Box>}
      {tab === 'response' && <Box><MainResponder ext={ext} /></Box>}
    </Box>
  })
}