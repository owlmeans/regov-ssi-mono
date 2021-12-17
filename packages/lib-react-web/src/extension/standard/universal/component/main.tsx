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

import { withRegov } from '@owlmeans/regov-lib-react'

import { UNIVERSAL_EXTENSION_SCREEN_PATH } from '../types'
import { MainBuilder } from './main/'


export const Main = (ns: string) => {

  return withRegov({ namespace: ns }, ({ t }) => {
    const { tab } = useParams()
    const navigate = useNavigate()

    return <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={(_, tab) => navigate(`${UNIVERSAL_EXTENSION_SCREEN_PATH}/${tab}`)}
          variant="scrollable" scrollButtons="auto">
          <Tab label={t('tab.build.label')} value="build" />
          <Tab label={t('tab.sign.label')} value="sign" />
          <Tab label={t('tab.claim.label')} value="claim" />
          <Tab label={t('tab.offer.label')} value="offer" />
          <Tab label={t('tab.request.label')} value="request" />
          <Tab label={t('tab.response.label')} value="response" />
        </Tabs>
      </Box>
      {tab === 'build' && <Box><MainBuilder ns={ns} /></Box>}
      {tab === 'sign' && <Box>2</Box>}
      {tab === 'claim' && <Box>3</Box>}
      {tab === 'offer' && <Box>3</Box>}
      {tab === 'request' && <Box>3</Box>}
      {tab === 'response' && <Box>3</Box>}
    </Box>
  })
}