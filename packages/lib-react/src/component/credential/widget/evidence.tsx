import React, { Fragment, FunctionComponent, useEffect, useState } from 'react'
import {
  EmptyImplProps, EmptyProps, RegovComponetProps, useRegov, withRegov, WrappedComponentProps
} from '../../../common'
import { Credential } from '@owlmeans/regov-ssi-core'
import { normalizeValue } from '@owlmeans/regov-ssi-common'
import { EXTENSION_TRIGGER_RETRIEVE_NAME, RetreiveNameEventParams } from '@owlmeans/regov-ssi-extension'


export const CredentialEvidenceWidget: FunctionComponent<EvidenceWidgetParams> = withRegov<EvidenceWidgetProps>(
  'CredentialEvidenceWidget', ({ t, i18n, credential, isChild, renderer: Renderer }) => {
    const evidence = normalizeValue(credential.evidence)
    const { extensions, handler } = useRegov()
    const [names, setNames] = useState<string[]>(new Array(evidence.length).fill(''))
    useEffect(() => {
      (async () => {
        if (extensions) {
          const newNames = new Array(evidence.length).fill('')
          await Promise.all(evidence.map(
            async (evidence, idx) => handler.wallet && extensions.triggerEvent<RetreiveNameEventParams>(
              handler.wallet, EXTENSION_TRIGGER_RETRIEVE_NAME, {
              credential: evidence as Credential, setName: (name: string) => { newNames[idx] = name }
            })
          ))
          setNames(newNames)
        }
      })()
    }, [credential.id])

    const props: EvidenceWidgetImplProps = {
      t, i18n, isChild, tabs: []
    }

    if (credential.evidence) {
      props.tabs = evidence.map((evidence, idx) => ({
        idx,
        title: names[idx].trim() !== '' ? names[idx] : `${t('widget.evidence.tabs.title')} ${idx}`,
        evidence: evidence as Credential
      }))

      return <Renderer {...props} />
    }

    return <Fragment />
  }, { namespace: 'regov-wallet-credential' })

export type EvidenceWidgetParams = EmptyProps & {
  credential: Credential
  isChild?: boolean
}

export type EvidenceWidgetProps = RegovComponetProps<EvidenceWidgetParams, EvidenceWidgetImplParams>

export type EvidenceWidgetImplParams = EmptyImplProps & {
  tabs: EvidenceTab[]
  isChild?: boolean
}

export type EvidenceTab = {
  idx: number
  title: string
  evidence: Credential
}

export type EvidenceWidgetImplProps = WrappedComponentProps<EvidenceWidgetImplParams>
