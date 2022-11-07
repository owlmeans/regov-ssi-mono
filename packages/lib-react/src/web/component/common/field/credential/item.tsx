import React, { FunctionComponent } from "react"
import { CredentialListItemInputProps, CredentialListItemInputRendererProps } from "./types"
import { EXRENSION_ITEM_PURPOSE_INPUT_ITEM, UIExtensionFactoryProduct, useRegov } from "../../../../../common"
import { CredentialListItemInputSimpleRenderer } from "./item/simple"
import { CredentialListItemTypeSelector } from "./item/selector"


export const CredentialListItemInput: FunctionComponent<CredentialListItemInputProps> = (
  { config, control, ns, index }
) => {
  const { extensions } = useRegov()
  const model = control.getItemControl(config.field, index)
  if (!model.getType()) {
    if (config.arbitraryEvidence) {
      return <CredentialListItemTypeSelector control={model} ns={ns} />
    }
  }

  const coms = extensions?.produceComponent(
    EXRENSION_ITEM_PURPOSE_INPUT_ITEM, model.getType()
  ) as UIExtensionFactoryProduct<CredentialListItemInputRendererProps>[]
  const props = { config, control, ns, index }
  if (coms.length) {
    const Renderer = coms[0].com
    if (Renderer) {
      return <Renderer {...props} />
    }
  }

  return <CredentialListItemInputSimpleRenderer {...props} />
}


