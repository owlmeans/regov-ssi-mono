import React, { Fragment, useState } from 'react'
import { 
  EXTENSION_ITEM_PURPOSE_VALIDATION, ResultWidgetParams, useRegov, ValidationResultWidget 
} from "@owlmeans/regov-lib-react"
import { Extension } from "@owlmeans/regov-ssi-extension"
import { FunctionComponent } from "react"
import { REGOV_EXT_SIGNATURE_NAMESPACE, SignatureSubject } from "../../../types"
import { Collapse, List, ListItemAvatar, ListItemButton, ListItemText, Typography } from '@mui/material'
import { getCompatibleSubject, Credential } from '@owlmeans/regov-ssi-core'
import { normalizeValue } from '@owlmeans/regov-ssi-common'
import { EvidenceTrust, EvidenceTrustHandle } from '@owlmeans/regov-mold-wallet-web'
import { Done, ErrorOutline, ExpandLess, ExpandMore } from '@mui/icons-material'


export const ValidationWidget = (_: Extension): FunctionComponent<ResultWidgetParams> =>
  (props: ResultWidgetParams) => <ValidationResultWidget ns={props.ns || REGOV_EXT_SIGNATURE_NAMESPACE}
    result={props.result} reload={props.reload} com={(props) => {
      const { result, reload, t } = props
      const subject = getCompatibleSubject<SignatureSubject>(result.instance as Credential)
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
          <ListItemText primary={<Typography variant="body2">{`ID: ${subject.name}`}</Typography>}
            secondary={<Fragment>
              <Typography variant='caption'>{
                t(`widget.validation.main.${result.result.trusted ? 'trusted' : 'untrusted'}`)
              }</Typography>
              <Typography variant='caption'>{
                t(`widget.validation.main.${result.result.valid ? 'valid' : 'invalid'}`)
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