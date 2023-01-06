import { DIDCommConnectMeta } from "@owlmeans/regov-comm"
import { Extension } from "@owlmeans/regov-ssi-core"
import React, { Fragment, FunctionComponent } from "react"
import { DefaultDescription, DefaultPresentation } from "../../../custom.types"


export const CredentialView: FunctionComponent<CredentialViewProps> = () => {
  return <Fragment>Hello world</Fragment>
}

export type CredentialViewProps = {
  descr: DefaultDescription
  offer: DefaultPresentation
  ext: Extension
  conn?: DIDCommConnectMeta
  close?: () => void
}