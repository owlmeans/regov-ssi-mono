import React, {
  FunctionComponent
} from 'react'
import {
  EmptyProps,
  RegovComponetProps,
  useRegov,
  withRegov,
  EXTENSION_ITEM_PURPOSE_VALIDATION,
  ResultWidgetParams as ResultItemWidgetParams
} from '@owlmeans/regov-lib-react'
import {
  ValidationResult
} from '@owlmeans/regov-ssi-extension'
import { Avatar, List, ListItem, ListItemAvatar, ListItemText, ListSubheader } from '@mui/material'
import { Done, ErrorOutline } from '@mui/icons-material'
import { normalizeValue } from '@owlmeans/regov-ssi-common'


export const ValidationResultWidget: FunctionComponent<ResultWidgetParams> = withRegov<ResultWidgetProps>({
  namespace: 'regov-wallet-credential'
}, ({ t, result }) => {
  const {extensions} = useRegov()

  return <List subheader={<ListSubheader>{t('widget.validation.header.title')}</ListSubheader>}>
    <ListItem>
      <ListItemAvatar>
        <Avatar>
          {result.trusted && result.valid
            ? <Done color="success" />
            : <ErrorOutline color="error" />}
        </Avatar>
      </ListItemAvatar>
      <ListItemText primary={t(`widget.validation.main.${result.trusted ? 'trusted' : 'untrusted'}`)}
        secondary={t(`widget.validation.main.${result.valid ? 'valid' : 'invalid'}`)} />
    </ListItem>
    {normalizeValue(result.evidence).flatMap(
      evidence => {
        const coms = extensions?.produceComponent(EXTENSION_ITEM_PURPOSE_VALIDATION, evidence.type) || []
        
        return coms.map((com, idx) => {
          const Renderer = com.com as FunctionComponent<ResultItemWidgetParams>
          return <Renderer key={idx} result={evidence} />
        })
      }
    )}
  </List>
})

export type ResultWidgetParams = EmptyProps & {
  result: ValidationResult
}

export type ResultWidgetProps = RegovComponetProps<ResultWidgetParams>