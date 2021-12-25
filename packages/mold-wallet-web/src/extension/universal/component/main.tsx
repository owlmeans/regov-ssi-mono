import React from 'react'

import {
  Box,
  Tab,
  Tabs
} from '@mui/material'
import {
  useNavigate,
  useParams
} from 'react-router-dom'

import {
  withRegov
} from '@owlmeans/regov-lib-react'

import { UNIVERSAL_EXTENSION_SCREEN_PATH } from '../types'
import { 
  Extension, 
  UniversalCredentialT 
} from '@owlmeans/regov-ssi-extension'
import {
  MainBuilder,
  MainSigner,
  MainClaimer,
  MainProposer,
  MainRequester,
  MainResponder,
  MainReader
} from './main/'


export const Main = (ext: Extension<UniversalCredentialT>) => {

  return withRegov({ namespace: ext.localization?.ns }, ({ t }) => {
    const { tab } = useParams()
    const navigate = useNavigate()

    return <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
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