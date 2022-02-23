import React, { Fragment, FunctionComponent, useState } from 'react'
import { Credential, getCompatibleSubject } from '@owlmeans/regov-ssi-core'
import { Collapse, List, ListItemAvatar, ListItemButton, ListItemText, Typography } from '@mui/material'
import { Done, ExpandLess, ExpandMore, ErrorOutline } from '@mui/icons-material'
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
      const [opened, setOpened] = useState<boolean>(false)
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
          {
            evidence.length > 0
              ? opened
                ? <ExpandLess onClick={() => setOpened(false)} />
                : <ExpandMore onClick={() => setOpened(true)} />
              : undefined
          }
        </ListItemButton>
        <EvidenceTrust handle={handle} />
        {evidence.map((evidence) => {
          const coms = extensions?.produceComponent(EXTENSION_ITEM_PURPOSE_VALIDATION, evidence.type) || []
          return <Collapse in={opened} unmountOnExit>
            <List>
              {coms.map((com, idx) => {
                const Renderer = com.com as FunctionComponent<ResultWidgetParams>
                return <Renderer key={idx} reload={reload} result={evidence} />
              })}
            </List>
          </Collapse>
        })}
      </Fragment>
    }} />