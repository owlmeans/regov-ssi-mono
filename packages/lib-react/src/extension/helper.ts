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

import { addObserverToSchema, Extension } from "@owlmeans/regov-ssi-core"
import {
  EXTENSION_TIRGGER_MAINMODAL_SHARE_HANDLER, MainModalHandle, MainModalShareEventParams
} from "../component/main/modal"
import { ManuItemParams, MenuActionResult } from "./types"


export const castMenuItemParams = async (item: ManuItemParams): Promise<MenuActionResult | void> => {
  return typeof item.action === 'function'
    ? await item.action()
    : typeof item.action === 'string'
      ? { path: item.action } : item.action
}

export const castMainModalHandler = (extension: Extension) => {
  const handler: { handle?: MainModalHandle } = {}
  extension.schema = addObserverToSchema(extension.schema, {
    trigger: EXTENSION_TIRGGER_MAINMODAL_SHARE_HANDLER,
    method: async (_, params: MainModalShareEventParams) => {
      handler.handle = params.handle

      return false
    }
  })

  return handler
}

export type CastMainModalParams = {
  cleanUp?: () => void
}