import { FunctionComponent } from "react"

import {
  Extension,
  ExtensionItemPurpose
} from "@owlmeans/regov-ssi-extension"
import {
  EmptyProps,
} from "../common"
import { ManuItemParams } from "../component"

export const buildUIExtension = <
  CredType extends string,
  FlowType extends string | undefined = undefined
>(
  extension: Extension<CredType, FlowType>,
  produceComponent: UIExtensionFactory<CredType>
) => {
  const _extension: UIExtension<CredType, FlowType> = {
    extension,

    produceComponent
  }

  return _extension
}

export type UIExtension<
  CredType extends string,
  FlowType extends string | undefined = undefined
  > = {
    extension: Extension<CredType, FlowType>

    produceComponent: UIExtensionFactory<CredType>

    menuItems?: ManuItemParams[]
  }

export type UIExtensionFactory<CredType extends string> = <
  Type extends EmptyProps = EmptyProps
  >(
  purpose: ExtensionItemPurpose,
  type?: CredType
) => UIExtensionFactoryProduct<Type>[]

export type UIExtensionFactoryProduct<
  Type extends EmptyProps = EmptyProps
  > = {
    com: FunctionComponent<Type>
    extensionCode: string
    order?: number | ({ before?: string[], after?: string[] })
    params?: { [key: string]: string | number | boolean }
  }