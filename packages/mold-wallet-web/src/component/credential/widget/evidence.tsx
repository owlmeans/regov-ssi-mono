import React, {
  Fragment,
  FunctionComponent,
  useState
} from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Tab,
  Tabs,
  Typography,
  Divider
} from '@mui/material'
import {
  CredentialEvidenceWidget,
  EvidenceWidgetImplProps,
  EXTENSION_ITEM_PURPOSE_EVIDENCE,
  PurposeEvidenceWidgetParams,
  useRegov
} from '@owlmeans/regov-lib-react'
import {
  CredentialWrapper,
  CredentialSubject,
  Credential
} from '@owlmeans/regov-ssi-core'
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
    <CardHeader title={t('widget.evidence.header.title')}
      subheader={
        <Fragment>
          <Tabs value={tabIdx} onChange={(_, tabIdx) => setTab(tabIdx)}>
            {tabs.map(
              tab => <Tab key={`${tab.idx}`} value={tab.idx} label={tab.title} />
            )}
          </Tabs>
          <Divider />
        </Fragment>
      } />
    <CardContent>
      <Grid container direction="column" justifyContent="flex-start" alignItems="stretch">
        {!isChild && <Grid item>
          <Renderer wrapper={
            { credential: tab.evidence, meta: { secure: false, title: tab.title } } as CredentialWrapper<
              CredentialSubject, Credential<CredentialSubject>
            >
          } />
        </Grid>}
        {tab.evidence.evidence && <Grid item>
          <Accordion TransitionProps={{ unmountOnExit: true }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography>{t('widget.evidence.accordion.summary')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <CredentialEvidenceWidget isChild credential={tab.evidence as Credential} />
            </AccordionDetails>
          </Accordion>
        </Grid>}
      </Grid>
    </CardContent>
  </Card >
}