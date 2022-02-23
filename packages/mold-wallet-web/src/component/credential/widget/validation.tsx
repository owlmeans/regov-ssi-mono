import React, { Fragment, FunctionComponent } from 'react'
import {
  EmptyProps, RegovComponentProps, useRegov, withRegov, EXTENSION_ITEM_PURPOSE_VALIDATION,
  ResultWidgetParams as ResultItemWidgetParams
} from '@owlmeans/regov-lib-react'
import { ValidationResult } from '@owlmeans/regov-ssi-extension'
import {
  Accordion, AccordionDetails, AccordionSummary, Avatar, List, ListItemAvatar, ListItemButton,
  ListItemText, ListSubheader, Typography
} from '@mui/material'
import { Done, ErrorOutline, ExpandMore } from '@mui/icons-material'
import { normalizeValue } from '@owlmeans/regov-ssi-common'
import { EvidenceTrust, EvidenceTrustHandle } from './evidence/'


export const ValidationResultWidget: FunctionComponent<ResultWidgetParams> = withRegov<ResultWidgetProps>({
  namespace: 'regov-wallet-credential'
}, ({ t, reload, result }) => {
  const { extensions } = useRegov()
  const handle: EvidenceTrustHandle = { reload }

  return <Fragment>
    <List subheader={<ListSubheader>
      <Typography variant="subtitle1">{t('widget.validation.header.title')}</Typography>
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
        <ListItemText primary={t(`widget.validation.main.${result.trusted ? 'trusted' : 'untrusted'}`)}
          secondary={t(`widget.validation.main.${result.valid ? 'valid' : 'invalid'}`)} />
      </ListItemButton>
      <EvidenceTrust handle={handle} />
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle2">{t('widget.validation.header.parent')}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {normalizeValue(result.evidence).flatMap(
            result => {
              const coms = extensions?.produceComponent(EXTENSION_ITEM_PURPOSE_VALIDATION, result.type) || []
              return coms.map((com, idx) => {
                const Renderer = com.com as FunctionComponent<ResultItemWidgetParams>
                return <Renderer key={idx} reload={reload} result={result} />
              })
            }
          )}
        </AccordionDetails>
      </Accordion>
    </List>
  </Fragment>
})

export type ResultWidgetParams = EmptyProps & {
  result: ValidationResult
  reload?: () => void
}

export type ResultWidgetProps = RegovComponentProps<ResultWidgetParams>