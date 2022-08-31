import React, { Fragment, FunctionComponent } from "react"
import { buildCredentialListControl } from "./control"
import { CredentialListInputPopup } from './popup'
import { CredentialListInputProps, isCredentialListControl } from "./types"
import List from '@mui/material/List'
import { useRegov } from "../../../../../common"


export const CredentialListInput: FunctionComponent<CredentialListInputProps> =
  ({ config, ns }: CredentialListInputProps) => {
    const { extensions } = useRegov()
    const control = isCredentialListControl(config) ? config : buildCredentialListControl(config, extensions)
    return <Fragment>
      <List>{control.renderFields(ns)}</List>
      <CredentialListInputPopup control={control} />
    </Fragment>
  }