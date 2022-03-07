/**
 *  Copyright 2022 OwlMeans
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

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