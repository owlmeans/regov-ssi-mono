import { Fragment, FunctionComponent, useMemo, useState } from "react"
import { buildCredentialListControl } from "./control"
import { CredentialListInputPopup } from './popup'
import { CredentialListInputProps, isCredentialListControl } from "./types"
import List from '@mui/material/List'
import { useRegov } from "../../../../../common"
import { useFormContext } from "react-hook-form"


export const CredentialListInput: FunctionComponent<CredentialListInputProps> =
  ({ field, config, ns }: CredentialListInputProps) => {
    const { setValue, getValues } = useFormContext()
    const { extensions } = useRegov()
    const [notification, setNotification] = useState(0)

    const control = useMemo(
      () => {
        const control = isCredentialListControl(config) ? config : buildCredentialListControl(config, extensions)
        control.setValues(getValues(field))

        return control
      },
      [field, config]
    )

    control.setNotifier(() => {
      setValue && setValue(field, control.getValues())
      setNotification(notification + 1)
    })

    return <Fragment>
      <List>{control.renderFields(ns)}</List>
      <CredentialListInputPopup control={control} />
    </Fragment>
  }