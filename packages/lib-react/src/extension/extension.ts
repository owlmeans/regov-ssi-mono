import { FunctionComponent } from "react"

import {
  Extension,
  ExtensionItemPurpose
} from "@owlmeans/regov-ssi-extension"
import {
  EmptyProps,
} from "../common"
import { ManuItemParams } from "../component"

export const buildUIExtension = <CredType extends string>(
  extension: Extension<CredType>,
  produceComponent: UIExtensionFactory<CredType>
) => {
  const _extension: UIExtension<CredType> = {
    extension,

    produceComponent
  }

  return _extension
}

export type UIExtension<
  CredType extends string, 
  Ext extends Extension<CredType> = Extension<CredType> 
> = {
    extension: Ext

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