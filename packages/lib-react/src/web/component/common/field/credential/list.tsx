import React, { Fragment, FunctionComponent, useMemo, useState } from "react"
import { buildCredentialListControl } from "./control"
import { CredentialListInputPopup } from './popup'
import { CredentialListInputProps, isCredentialListControl } from "./types"
import List from '@mui/material/List'
import { useRegov } from "../../../../../common"


export const CredentialListInput: FunctionComponent<CredentialListInputProps> =
  ({ config, ns }: CredentialListInputProps) => {
    const { extensions } = useRegov()
    const [notification, setNotification] = useState(0)
    const control = useMemo(
      () => isCredentialListControl(config) ? config : buildCredentialListControl(config, extensions),
      [config]
    )
    control.setNotifier(() => setNotification(notification + 1))

    return <Fragment>
      <List>{control.renderFields(ns)}</List>
      <CredentialListInputPopup control={control} />
    </Fragment>
  }