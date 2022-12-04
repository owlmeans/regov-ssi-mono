import { Extension } from "@owlmeans/regov-ssi-core"
import React, { Fragment, FunctionComponent } from "react"

import { CustomDescription } from "../../../custom.types"


export const ClaimPreview = (ext: Extension, descr: CustomDescription): FunctionComponent =>
 () => {
  console.log(ext, descr)
  return <Fragment>Hello world 2</Fragment>
 }