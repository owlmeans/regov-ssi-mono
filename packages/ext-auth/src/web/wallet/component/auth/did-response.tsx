import { EmptyProps, RegovComponentProps, withRegov } from "@owlmeans/regov-lib-react"
import { Presentation } from "@owlmeans/regov-ssi-core"
import React, { Fragment } from "react"
import { REGOV_EXT_ATUH_NAMESPACE } from "../../../../types"


export const DIDAuthResponse = withRegov<DIDAuthResponseProps>(
  { namespace: REGOV_EXT_ATUH_NAMESPACE }, ({ request }) => {
    console.log(request)
    
    return <Fragment>Hello world</Fragment>
  })

export type DIDAuthResponseParams = EmptyProps & {
  request: Presentation
}

export type DIDAuthResponseProps = RegovComponentProps<DIDAuthResponseParams>