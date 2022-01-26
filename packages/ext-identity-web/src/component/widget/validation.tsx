import React, {
  Fragment,
  FunctionComponent,
  useState
} from 'react'
import {
  Credential,
  geCompatibletSubject
} from '@owlmeans/regov-ssi-core'
import {
  Collapse,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography
} from '@mui/material'
import {
  Done,
  ExpandLess,
  ExpandMore,
  ErrorOutline
} from '@mui/icons-material'
import { IdentitySubject } from '@owlmeans/regov-ext-identity'
import {
  EXTENSION_ITEM_PURPOSE_VALIDATION,
  ResultWidgetParams,
  useRegov,
  ValidationResultWidget,
  ResultWidgetParams as ResultItemWidgetParams
} from '@owlmeans/regov-lib-react'
import { normalizeValue } from '@owlmeans/regov-ssi-common'
import { Extension } from '@owlmeans/regov-ssi-extension'
import { REGOV_IDENTITY_DEFAULT_NAMESPACE } from '../../types'


export const ValidationWidget = (_: Extension<string>): FunctionComponent<ResultWidgetParams> =>
  (props: ResultWidgetParams) => <ValidationResultWidget ns={props.ns || REGOV_IDENTITY_DEFAULT_NAMESPACE}
    result={props.result} com={(props) => {
      const { result, t } = props
      const subject = geCompatibletSubject<IdentitySubject>(result.instance as Credential)
      const [opened, setOpened] = useState<boolean>(false)
      const { extensions } = useRegov()

      const evidence = normalizeValue(result.result.evidence)

      return <Fragment>
        <ListItem>
          <ListItemAvatar>
            {result.result.trusted && result.result.valid
              ? <Done fontSize="small" color="success" />
              : <ErrorOutline fontSize="small" color="error" />}
          </ListItemAvatar>
          <ListItemText primary={<Typography variant="body2">{`ID: ${subject.identifier}`}</Typography>}
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
        </ListItem>
        {evidence.map((evidence) => {
          const coms = extensions?.produceComponent(EXTENSION_ITEM_PURPOSE_VALIDATION, evidence.type) || []
          return <Collapse in={opened} unmountOnExit>
            <List>
              {coms.map((com, idx) => {
                const Renderer = com.com as FunctionComponent<ResultItemWidgetParams>
                return <Renderer key={idx} result={evidence} />
              })}
            </List>
          </Collapse>
        })}
      </Fragment>
    }} />