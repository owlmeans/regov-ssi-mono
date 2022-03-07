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

import { MaybeArray } from "../../common"
import { Extension } from "../ext"
import { ExtensionEvent } from "../schema"


export type ExtensionRegistry = {
  extensions: Extension[],
  registerAll: (exts: Extension[]) => Promise<void>
  getExtensions: (type: string) => Extension[]
  getExtension: (type: string | string[], code?: string) => Extension
  register: (ext: Extension) => Promise<void>
  registerSync: (ext: Extension) => void
  getObservers: (event: MaybeArray<string>) => [ExtensionEvent, Extension][]
}


export const ERROR_NO_EXTENSION = 'ERROR_NO_EXTENSION'