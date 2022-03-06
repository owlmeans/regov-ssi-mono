import { FunctionComponent } from "react"
import { Extension } from "@owlmeans/regov-ssi-core"
import { EmptyProps } from "../common"
import { ManuItemParams, ExtensionItemPurpose } from "./types"
import { MaybeArray } from "@owlmeans/regov-ssi-core"

export const buildUIExtension = (
  extension: Extension,
  produceComponent: UIExtensionFactory
) => {
  const _extension: UIExtension = {
    extension,

    produceComponent
  }

  return _extension
}

export type UIExtension = {
  extension: Extension

  produceComponent: UIExtensionFactory

  menuItems?: ManuItemParams[]
}

export type UIExtensionFactory = <
  Type extends EmptyProps = EmptyProps
  >(
  purpose: ExtensionItemPurpose,
  type?: MaybeArray<string>
) => UIExtensionFactoryProduct<Type>[]

export type UIExtensionFactoryProduct<
  Type extends EmptyProps = EmptyProps
  > = {
    com: FunctionComponent<Type>
    extensionCode: string
    order?: number | ({ before?: string[], after?: string[] })
    params?: { [key: string]: string | number | boolean }
  }