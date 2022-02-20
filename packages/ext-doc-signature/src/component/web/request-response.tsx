import { EmptyProps, RegovComponentProps, withRegov } from '@owlmeans/regov-lib-react'
import { Presentation } from '@owlmeans/regov-ssi-core'
import { Extension } from '@owlmeans/regov-ssi-extension'
import React, { FunctionComponent } from 'react'
import { REGOV_EXT_SIGNATURE_NAMESPACE } from '../../types'


export const SignatureRequestResponseWeb: FunctionComponent<SignatureRequestResponseParams> =
  withRegov<SignatureRequestResponseProps>({ namespace: REGOV_EXT_SIGNATURE_NAMESPACE }, () => {
    return <div>Hello world</div>
  })

export type SignatureRequestResponseParams = EmptyProps & {
  ext: Extension
  credential: Presentation
  close?: () => void
}

export type SignatureRequestResponseProps = RegovComponentProps<SignatureRequestResponseParams>