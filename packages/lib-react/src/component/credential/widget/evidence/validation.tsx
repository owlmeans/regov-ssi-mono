import React, { Fragment, FunctionComponent } from 'react'
import { 
  EmptyProps,
  RegovComponetProps,
  withRegov, 
  WrappedComponentProps
} from '../../../../common'
import { 
  EvidenceValidationResult 
} from '@owlmeans/regov-ssi-extension'


export const ValidationResultWidget: FunctionComponent<ResultWidgetParams> = withRegov<ResultWidgetProps>(
  {namespace: 'regov-wallet-credential'},
  ({t, i18n, result, com: Renderer}) => {
    const props = {
      t, i18n, result
    }

    return Renderer ? <Renderer {...props}/> : <Fragment />
  }
)

export type ResultWidgetParams = EmptyProps & {
  result: EvidenceValidationResult
  com?: FunctionComponent<ResultWidgetImplProps>
}

export type ResultWidgetProps = RegovComponetProps<ResultWidgetParams, ResultWidgetImplParams>

export type ResultWidgetImplParams = {
  result: EvidenceValidationResult
}

export type ResultWidgetImplProps = WrappedComponentProps<ResultWidgetImplParams>