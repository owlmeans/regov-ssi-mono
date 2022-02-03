import { RegovGroupExtension, REGOV_EXT_GROUP_NAMESPACE } from '@owlmeans/regov-ext-groups'
import { EmptyProps, RegovComponetProps, withRegov } from '@owlmeans/regov-lib-react'
import React, { Fragment, FunctionComponent } from 'react'
import { Presentation } from '@owlmeans/regov-ssi-core'
import { DialogContent } from '@mui/material'


export const MembershipOffer: FunctionComponent<MembershipOfferParams> = withRegov<MembershipOfferProps>({
  namespace: REGOV_EXT_GROUP_NAMESPACE
}, ({ credential }) => {

  return <Fragment>
    <DialogContent>
      <pre>{JSON.stringify(credential, undefined, 2)}</pre>
    </DialogContent>
  </Fragment>
})

export type MembershipOfferParams = EmptyProps & {
  ext: RegovGroupExtension
  credential: Presentation
  close?: () => void
}

export type MembershipOfferProps = RegovComponetProps<MembershipOfferParams>