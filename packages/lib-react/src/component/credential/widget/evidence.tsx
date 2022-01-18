import React, {
  FunctionComponent
} from 'react'
import {
  EmptyImplProps,
  EmptyProps,
  RegovCompoentProps,
  withRegov,
  WrappedComponentProps
} from '../../..'


export const CredentialEvidenceWidget: FunctionComponent<EvidenceWidgetParams> = withRegov<EvidenceWidgetProps>(
  'CredentialEvidenceWidget', () => {

    return <div>Evidence tabs and lists</div>
  }, { namespace: 'regov-wallet-credential' })

export type EvidenceWidgetParams = EmptyProps & {
}

export type EvidenceWidgetProps = RegovCompoentProps<EvidenceWidgetParams, EvidenceWidgetImplParams>

export type EvidenceWidgetImplParams = EmptyImplProps & {
}

export type EvidenceWidgetImplProps = WrappedComponentProps<EvidenceWidgetImplParams>
