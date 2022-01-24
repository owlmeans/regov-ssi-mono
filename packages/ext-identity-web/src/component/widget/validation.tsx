import { List, ListItem, ListItemText } from '@mui/material'
import { IdentitySubject } from '@owlmeans/regov-ext-identity'
import {
  ResultWidgetParams,
  ValidationResultWidget
} from '@owlmeans/regov-lib-react'
import { normalizeValue } from '@owlmeans/regov-ssi-common'
import { geCompatibletSubject } from '@owlmeans/regov-ssi-core'
import { Extension } from '@owlmeans/regov-ssi-extension'
import React, {
  FunctionComponent
} from 'react'
import {
  Credential
} from '@owlmeans/regov-ssi-core'
import { REGOV_IDENTITY_DEFAULT_NAMESPACE } from '../../types'


export const ValidationWidget = (_: Extension<string>): FunctionComponent<ResultWidgetParams> =>
  (props: ResultWidgetParams) => <ValidationResultWidget ns={props.ns || REGOV_IDENTITY_DEFAULT_NAMESPACE}
    result={props.result} com={(props) => {
      const { result } = props
      const subject = geCompatibletSubject<IdentitySubject>(result.instance as Credential)
      /**
       * @TODO
       * 1. Add trust and validation vizualization
       * 2. Add Collapse component to unwrap nested lists
       */
      return <List>
        <ListItem>
          <ListItemText primary={`ID: ${subject.identifier}`} />
        </ListItem>
        {
          normalizeValue(result.result.evidence).map(
            (evidence) => {
              /**
               * @TODO use event to recurse the display
               */
              return <ListItem>
                <ListItemText key={evidence.type} primary={evidence.type} />
              </ListItem>
            }
          )
        }
      </List>
    }} />