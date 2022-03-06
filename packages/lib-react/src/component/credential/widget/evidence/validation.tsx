import React, { Fragment, FunctionComponent } from 'react'
import { EmptyProps, RegovComponentProps, withRegov, WrappedComponentProps } from '../../../../common/'
import { EvidenceValidationResult } from '@owlmeans/regov-ssi-core'


export const ValidationResultWidget: FunctionComponent<ResultWidgetParams> = withRegov<ResultWidgetProps>(
  { namespace: 'regov-wallet-credential' },
  ({ t, i18n, result, reload, com: Renderer }) => {
    const props = {
      t, i18n, result, reload
    }

    return Renderer ? <Renderer {...props} /> : <Fragment />
  }
)

export type ResultWidgetParams = EmptyProps & {
  result: EvidenceValidationResult
  reload?: () => void
  com?: FunctionComponent<ResultWidgetImplProps>
}

export type ResultWidgetProps = RegovComponentProps<ResultWidgetParams, ResultWidgetImplParams>

export type ResultWidgetImplParams = {
  reload?: () => void
  result: EvidenceValidationResult
}

export type ResultWidgetImplProps = WrappedComponentProps<ResultWidgetImplParams>