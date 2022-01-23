import React, { FunctionComponent } from 'react'
import { Extension } from '@owlmeans/regov-ssi-extension'
import {
  EmptyProps,
  PurposeEvidenceWidgetParams,
  RegovComponetProps,
  withRegov
} from '@owlmeans/regov-lib-react'
import {
  Paper,
} from '@mui/material'
import {
  geCompatibletSubject
} from '@owlmeans/regov-ssi-core'
import { EntityRenderer, EntityTextRenderer } from '@owlmeans/regov-mold-wallet-web'
import { GroupSubject } from '@owlmeans/regov-ext-groups'


export const EvidenceWidget = (ext: Extension<string>): FunctionComponent<EvidenceWidgetParams> =>
  withRegov<EvidenceWidgetProps>({ namespace: ext.localization?.ns }, (props: EvidenceWidgetProps) => {
    const { wrapper, t } = props

    const subject = geCompatibletSubject<GroupSubject>(wrapper.credential)

    return <Paper elevation={3}>
      <EntityRenderer t={t} entity="group" subject={subject}>
        <EntityTextRenderer field="name" showLabel netSize={6} />
        {subject.description.trim() !== "" && <EntityTextRenderer field="description" showLabel />}
        <EntityTextRenderer field="createdAt" showLabel netSize={6} />
        <EntityTextRenderer field="uuid" showLabel netSize={6} />
      </EntityRenderer>
    </Paper>
  })

export type EvidenceWidgetParams = EmptyProps & PurposeEvidenceWidgetParams

export type EvidenceWidgetProps = RegovComponetProps<EvidenceWidgetParams>