import { MembershipSubject, RegovGroupExtension, REGOV_EXT_GROUP_NAMESPACE } from '@owlmeans/regov-ext-groups'
import { EmptyProps, RegovComponetProps, useRegov, withRegov } from '@owlmeans/regov-lib-react'
import { getCompatibleSubject, Presentation } from '@owlmeans/regov-ssi-core'
import React, {
  Fragment, FunctionComponent
} from 'react'


export const MembershipClaimView: FunctionComponent<ClaimViewParams> =
  withRegov<ClaimViewProps>({
    namespace: REGOV_EXT_GROUP_NAMESPACE
  }, ({ credential: presentation }) => {
    const subject = getCompatibleSubject<MembershipSubject>(presentation.verifiableCredential[0])
    const { handler, extensions } = useRegov()
    console.log(handler, extensions, subject)

    return <Fragment>
      <div>Hello world</div>
    </Fragment>
  })

export type ClaimViewParams = EmptyProps & {
  ext: RegovGroupExtension
  credential: Presentation
  close?: () => void
}

export type ClaimViewProps = RegovComponetProps<ClaimViewParams>