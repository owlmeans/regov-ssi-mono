import React, { Fragment, FunctionComponent } from 'react'
import { Credential, getCompatibleSubject } from '@owlmeans/regov-ssi-core'
import {
  Accordion, AccordionDetails, AccordionSummary, List, ListItem, ListItemAvatar, ListItemButton,
  ListItemText, Typography
} from '@mui/material'
import { Done, ExpandMore, ErrorOutline } from '@mui/icons-material'
import {
  EXTENSION_ITEM_PURPOSE_VALIDATION, ResultWidgetParams, useRegov, ValidationResultWidget
} from '@owlmeans/regov-lib-react'
import { normalizeValue } from '@owlmeans/regov-ssi-common'
import { Extension } from '@owlmeans/regov-ssi-extension'
import { EvidenceTrust, EvidenceTrustHandle } from '@owlmeans/regov-mold-wallet-web'
import { MembershipSubject, REGOV_EXT_GROUP_NAMESPACE } from '@owlmeans/regov-ext-groups'


export const MembershipValidationWidget = (_: Extension): FunctionComponent<ResultWidgetParams> =>
  (props: ResultWidgetParams) => <ValidationResultWidget ns={props.ns || REGOV_EXT_GROUP_NAMESPACE}
    result={props.result} reload={props.reload} com={(props) => {
      const { result, reload, t } = props
      const subject = getCompatibleSubject<MembershipSubject>(result.instance as Credential)
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
          <ListItemText primary={<Typography variant="body2">{`Code: ${subject.memberCode}`}</Typography>}
            secondary={<Fragment>
              <Typography variant='caption'>{
                t(`membership.widget.validation.${result.result.trusted ? 'trusted' : 'untrusted'}`)
              }</Typography>
              <br />
              <Typography variant='caption'>{
                t(`membership.widget.validation.${result.result.valid ? 'valid' : 'invalid'}`)
              }</Typography>
            </Fragment>} />
        </ListItemButton>
        <EvidenceTrust handle={handle} />
        {evidence.length > 0 && <ListItem sx={{ px: 0, mx: 0 }}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle2">{t('widget.validation.header.parent')}</Typography>
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