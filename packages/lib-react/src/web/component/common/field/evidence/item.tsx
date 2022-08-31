import React, { FunctionComponent } from "react"
import {
  CredentialListItemInputProps, CredentialListItemInputRenderer, CredentialListItemInputRendererProps
} from "./types"
import { EXRENSION_ITEM_PURPOSE_INPUT_ITEM, UIExtensionFactoryProduct, useRegov } from "../../../../../common"
import { useTranslation } from "react-i18next"

import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'


export const CredentialListItemInput: FunctionComponent<CredentialListItemInputProps> = (
  { config, control: control, ns }
) => {
  const { extensions } = useRegov()
  const coms = extensions?.produceComponent(
    EXRENSION_ITEM_PURPOSE_INPUT_ITEM, config.type
  ) as UIExtensionFactoryProduct<CredentialListItemInputRendererProps>[]
  const props = { config, control, ns }
  if (coms.length) {
    const Renderer = coms[0].com
    if (Renderer) {
      return <Renderer {...props} />
    }
  }

  return <CredentialListItemInputSimpleRenderer {...props} />
}

export const CredentialListItemInputSimpleRenderer: CredentialListItemInputRenderer = props => {
  const { t } = useTranslation(props.ns)
  return <ListItem>
    <ListItemButton onClick={() => props.control.openDetails(props.config, props.ns)}>
      {t(`input.${props.config.prefix ? `${props.config.prefix}.` : ''}${props.config.field}`)}
    </ListItemButton>
  </ListItem>
}
